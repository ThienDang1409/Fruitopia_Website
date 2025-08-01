const express = require('express');
const router = express.Router();
const { Messages } = require("../models/messages.js");
const { User } = require("../models/user.js");
const cloudinary = require("../helper/cloudinary.js");
const { getReceiverSocketId, getIo } = require("../helper/socketIO/socket.js");
const multer = require('../helper/multer.js')
const streamifier = require('streamifier');

const openAI = require("../helper/openai/openAI.js")
const {authenticateToken } = require("../middleware/authenticateToken");  // Đảm bảo openAi.js được require đúng
const getProductInfoText = require('../helper/openai/getProductInfoText.js');

const AI_USER_ID = process.env.AI_USER_ID; //AI_USER_ID=000000000000000000000000
const MAX_AI_QUESTIONS = Number(process.env.MAX_AI_QUESTIONS) || 5;



router.get('/users', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const me = await User.findById(adminId);
    if (!me.isAdmin) {
      return res.status(403).json({ error: "Chỉ admin mới truy cập được." });
    }

    // Lấy hết tin nhắn có liên quan đến admin
    const allMsgs = await Messages.find({
      $or: [
        { senderId: adminId },      // admin gửi
        { receiverId: adminId }     // admin nhận
      ]
    });

    // Tập hợp clientId (bên kia là client)
    const clientSet = new Set();
    allMsgs.forEach(m => {
      // nếu admin là receiver thì kia là sender (client)
      if (m.receiverId.toString() === adminId) {
        clientSet.add(m.senderId.toString());
      }
      // nếu admin là sender thì kia là receiver (client)
      else if (m.senderId.toString() === adminId) {
        clientSet.add(m.receiverId.toString());
      }
    });

    const clientIds = Array.from(clientSet);
    if (clientIds.length === 0) {
      return res.json([]);  // không có ai chat cả
    }

    // Lấy thông tin client từ User collection
    const clients = await User.find(
      { _id: { $in: clientIds } },
      "name email phone images"
    );
    res.json(clients);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get('/admin-info', authenticateToken, async (req, res) => {
  try {
    // Tìm mainAdmin đầu tiên (nếu chỉ có 1)
    const admin = await User.findOne({ role: 'mainAdmin' });
    if (!admin) return res.status(404).json({ error: 'No admin found' });
    // Trả về id và tên (hoặc email) của admin
    res.status(200).json({ _id: admin._id, name: admin.name, email: admin.email});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bot-history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const msgs = await Messages.find({
    $or: [
      { senderId: userId,   receiverId: AI_USER_ID },
      { senderId: AI_USER_ID, receiverId: userId }
    ]
  }).sort('createdAt');
  res.json(msgs);
});

router.get('/:id', authenticateToken, async(req, res) => {
    try {
        const myId = req.user.id;
        console.log(req.user)
        console.log(req.params.id)// lấy userId từ token
        const partnerId = req.params.id;
          // Lấy ID đối tác từ params
        
        const partner = await User.findById(partnerId);

        // Kiểm tra xem đối tác có phải là client hoặc mainAdmin không
        if (!partner || !['client', 'mainAdmin', 'storeAdmin', 'staff'].includes(partner.role)) {
            return res.status(400).json({ error: "Invalid partner. You can only chat with client or admin." });
        }

        // Lọc các tin nhắn giữa người dùng hiện tại và đối tác
        const messages = await Messages.find({
            $or: [
                { senderId: myId, receiverId: partnerId },
                { senderId: partnerId, receiverId: myId }
            ]
        })
        .populate('senderId')  // Populate thông tin người gửi
        .populate('receiverId');  // Populate thông tin người nhận

        res.status(200).json(messages);  // Trả về tin nhắn
    } catch (error) {
        console.log("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})


router.post('/send/:id', authenticateToken, multer.single('image'), async(req, res) => {
    
    try {
        const  text  = req.body.text;
        const imageFile = req.file;
        
        const senderId = req.user.id;
        const receiverId = req.params.id;  
        const sender = await User.findById(senderId); 
        const receiver = await User.findById(receiverId);
        const senderRole = sender.role;
        if (!receiver || !['mainAdmin', 'client', 'storeAdmin', 'staff'].includes(receiver.role) || !['mainAdmin', 'client', 'storeAdmin', 'staff'].includes(senderRole)) {
            return res.status(400).json({ error: 'You can only chat between client and mainAdmin' });
        }

        

        // Kiểm tra nếu vai trò của người gửi và người nhận không đúng      
        if ((senderRole === 'client' && receiver.role === 'client')  ) {
            return res.status(400).json({ error: 'You can only chat between client and admin' });
        }

        let imageUrl;
        if (imageFile) {
          const uploadFromBuffer = (buffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "chat_images" },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            streamifier.createReadStream(buffer).pipe(stream);
          });

          const uploadResult = await uploadFromBuffer(imageFile.buffer);
          imageUrl = uploadResult.secure_url;
        }
    
        // Lưu tin nhắn
        const newMessage = new Messages({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            senderRole: senderRole,  // Ghi nhận senderRole là admin hoặc client
        });
        await newMessage.save();
        const io = getIo();
    
        // Gửi tin nhắn cho người nhận nếu có socketId
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    
        res.status(200).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.post("/sendBot", authenticateToken,  multer.single("image"), async (req, res) => {
    try {
        const text = req.body.text;

        const imageFile = req.file;
        if (!text || !text.trim()) {
          return res.status(400).json({ error: "Bạn phải nhập nội dung cho AI." });
        }
        const senderId = req.user.id;

        // 1) Lấy thời gian hiện tại và xác định ngày hôm nay
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);  // Bắt đầu ngày hôm nay (00:00:00)
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);  // Kết thúc ngày hôm nay (23:59:59)

        // 2) Kiểm tra số câu hỏi đã gửi trong ngày
        // const askedCount = await Messages.countDocuments({
        //     senderId,
        //     receiverId: AI_USER_ID,
        //     createdAt: { $gte: todayStart, $lt: todayEnd },  // Kiểm tra trong ngày hôm nay
        // });

        // if (askedCount >= 5) {  // Giới hạn 5 câu hỏi trong một ngày
        //     return res.status(403).json({
        //         error: "Bạn đã hết lượt hỏi AI trong ngày, vui lòng quay lại vào ngày mai. Bạn có thể liên hệ admin để được hỗ trợ.",
        //     });
        // }

        // 3) Nếu có ảnh => upload lên Cloudinary
        let imageUrl;
        if (imageFile) {
            const uploadFromBuffer = buffer =>
              new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { folder: "chat_images" },
                  (err, result) => (err ? reject(err) : resolve(result))
                );
                streamifier.createReadStream(buffer).pipe(stream);
              });
            const uploadResult = await uploadFromBuffer(imageFile.buffer);
            imageUrl = uploadResult.secure_url;
        }

        // 4) Lưu tin nhắn của user => AI
        const userMsg = new Messages({
            senderId,
            receiverId: AI_USER_ID,  // ID của AI
            text,
            image: imageUrl,
            senderRole: "client",
        });
        await userMsg.save();
        const io = getIo();
       
        const userSocketId = getReceiverSocketId(senderId);
        if (userSocketId) io.to(userSocketId).emit("newMessage", userMsg);
        const productInfoText = await getProductInfoText(text);
        // 5) Gọi OpenAI để trả lời
        const completion = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",  // Hoặc có thể thay bằng phiên bản mới hơn nếu cần
            messages: [
              {
                role: "system",
                content: `Bạn là trợ lý ảo của FRUITOPIA. Trả lời đúng theo dữ liệu bên dưới, không bịa. Ưu tiên đề cập giá, tồn kho và khuyến mãi nếu có.`
              },
              { role: "user", content:`${productInfoText}\nCâu hỏi: ${text}`,}
            ],
            max_tokens: 1500,  // Điều chỉnh max_tokens theo yêu cầu
        });
        
        const botText = completion.choices[0].message.content.trim();

        // 6) Kiểm tra nếu GPT không thể trả lời => gửi tín hiệu chuyển admin
        const cannot =
            !botText ||
            /i (do not|don't) know|i'm not sure|không.*biết/i.test(botText);

        if (cannot) {
            const io = getIo();
            io.to(senderId.toString()).emit("transfer_to_admin");
            return res.status(200).json({ transfer: true });
        }

        // 7) Lưu tin nhắn từ AI => user
        const botMsg = new Messages({
            senderId: AI_USER_ID,  // ID của AI
            receiverId: senderId,
            text: botText,
            senderRole: "bot",
        });
        await botMsg.save();

        io.to(senderId.toString()).emit("newMessage", botMsg);

        // 9) Phản hồi về client
        return res.status(200).json(botMsg);
    } catch (err) {
        console.error("Error in sendBotMessage:", err.message);
        return res.status(500).json({ error: "Lỗi xử lý ChatGPT." });
    }
});

router.get('/count/unread', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const count = await Messages.countDocuments({
    receiverId: userId,
    // senderRole: 'mainAdmin',
    senderRole: { $in: ['mainAdmin', 'storeAdmin', 'staff'] },  
    isRead: false
  });
  res.json({ unreadCount: count });
});

// 2) đánh dấu đã đọc
router.put('/count/mark-read', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  await Messages.updateMany(
    { receiverId: userId, 
      // senderRole: 'mainAdmin',
      senderRole: { $in: ['mainAdmin', 'storeAdmin', 'staff'] }, 
      isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});

router.get('/count/unread-admin/:clientId', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const clientId = req.params.clientId;
    // chỉ đếm role client gửi đến admin
    const count = await Messages.countDocuments({
      senderId: clientId,
      receiverId: adminId,
      senderRole: 'client',
      isRead: false
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.put('/count/markread-admin/:clientId', authenticateToken, async (req, res) => {
  const adminId  = req.user.id;
  const clientId = req.params.clientId;
  // chỉ update những tin nhắn do client gửi tới admin chưa đọc
  await Messages.updateMany(
    { receiverId: adminId, senderRole: 'client', senderId: clientId, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});


module.exports = router;
