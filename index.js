const fs = require("fs")
const ytdl = require("@distube/ytdl-core")
const Youtube = require('youtube-search-api')
const login = require("facebook-chat-api")
const axios = require('axios')

YouTube_API = 'AIzaSyDvPsnqssxLHDNx_HFEYZH5iVIrTtufl-s'

const now = new Date()
const hours = now.getHours()
const minutes = now.getMinutes()
const seconds = now.getSeconds()
const time = `${hours}:${minutes}:${seconds}`
const pre = '[+]'


// const express = require('express')
// const app = express()
// const file = require('path')
// const htmlFilePath = file.join(__dirname, 'index.html')
// app.get('/', (req, res) => {
//   res.sendFile(htmlFilePath)
// })
// app.listen(3000, () => {
//   console.log('Server is running on http://localhost:3000')
// })
login({ appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8')) }, (err, api) => {
    if (err) return console.error(err)
    api.listenMqtt((err, message) => {
        text = message.body
        id = message.senderID
        if (message.isGroup === true) {
            id = message.threadID
        }
        if (id !== undefined && text !== undefined) {
            console.log(`${time} ${id} : ${text}`)
            if (text === 'loikhuyen' || text === 'Loikhuyen' || text === 'Lời khuyên' || text === 'lời khuyên') {
                list = ['Liều nhiều thì ăn nhiều',
                    'Đôi khi chúng ta tốn quá nhiều thời gian để nghĩ về một người trong khi họ chẳng nghĩ đến chúng ta nổi 1 giây',
                    'Thực ra những người hay cười, lại luôn cần người khác yêu thương',
                    'Làm hoặc không. Không có thử.',
                    'Sự thất bại hay thành công của mỗi người không phải do tài năng, trí tuệ mà là sự lựa chọn đúng khi cơ hội đến.',
                    'Hãy nhớ rằng cơ hội sẽ mất đi khi sống thiếu trách nhiệm.',
                    '']
                random = Math.floor(Math.random() * (list.length))
                res = list[random]
                api.sendMessage({ body: res }, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text.split(' ')[0] === 'sing') {
                async function downloadMusicFromYoutube(link, path) {
                    var timestart = Date.now();
                    if (!link) return 'Thiếu link';

                    return new Promise((resolve, reject) => {
                        const stream = ytdl(link, {
                            quality: 'highestaudio',
                            highWaterMark: 1 << 25,
                        });

                        const writeStream = fs.createWriteStream(path);
                        stream.pipe(writeStream);

                        stream.on('end', async () => {
                            var data = await ytdl.getInfo(link);
                            var result = {
                                title: data.videoDetails.title,
                                dur: Number(data.videoDetails.lengthSeconds),
                                viewCount: data.videoDetails.viewCount,
                                likes: data.videoDetails.likes,
                                author: data.videoDetails.author.name,
                                timestart: timestart,
                            };
                            resolve(result);
                        });

                        stream.on('error', (error) => {
                            reject(error);
                        });
                    });
                }

                async function search(keyword) {
                    const results = await Youtube.GetListByKeyword(keyword, false, 5)
                    if (results.items.length > 0) {
                        return results.items
                    }
                }
                async function choose(keyword) {
                    results = await search(keyword)
                    num = 0
                    msg = ''
                    for (let value of results) {
                        num = num + 1
                        msg += (`${num} - ${value.title} (${value.length.simpleText})\n\n`)
                    }
                    res = `Có ${num} kết quả trùng với từ khoá tìm kiếm của bạn:\n\n${msg}» Hãy reply(phản hồi) chọn một trong những tìm kiếm trên`
                    api.sendMessage(res, id)
                    return new Promise((resolve, reject) => {
                        api.listenMqtt((err, message) => {
                            if (message.type === 'message_reply') {
                                choice = message.body
                                api.unsendMessage(message.messageReply.messageID, (err))
                                resolve(results[choice - 1])
                            }
                        })
                    })
                }
                async function sing(keyword) {
                    const video = await choose(keyword)
                    api.sendMessage('Sending ...', id)
                    if (video) {
                        path = `Music/${video.id}.mp3`
                        const mp3FilePath = await downloadMusicFromYoutube(video.id, path)
                        if (fs.statSync(path).size < 26214400) {
                            api.sendMessage({
                                body: mp3FilePath.title,
                                attachment: fs.createReadStream(`./${path}`)
                            }, id)
                        } else {
                            api.sendMessage(`Không thể gửi vì File > 25Mb`, id)
                        }
                    }
                }
                keyword = text.split('sing ')[1]
                sing(keyword)
            }
            if (text === 'hello' || text === 'hi' || text === 'Hello' || text === 'Hi') {
                res = 'Đây là Project Chat Bot của @svnmarco.'
                api.sendMessage({ body: res }, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if ((text === 'hacker lỏ' || text === 'Hacker lỏ' || text === 'hacker lỏd' || text === 'Hacker lỏd')) {
                res = 'Lỏ Con Kẹc'
                api.sendMessage({ body: res }, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'chitay' || text === 'Chitay') {
                res = 'Cả thế giới đang chỉ tay vào bạn'
                api.sendMessage({ body: res, attachment: fs.createReadStream(`./chitay.png`) }, id)
            }
            if (text === 'paimon') {
                res = 'Con Kẹc'
                api.sendMessage({ body: res, attachment: fs.createReadStream(`./paimon.png`) }, id)
            }
            if (text === 'help' || text === 'Help') {
                res = `Hiện tại có những lệnh sau 
                \n${pre}help : Show all lệnh hoặc tìm hiểu cách dùng 1 lệnh nào đó
                \n${pre}chitay : chỉ tay
                \n${pre}sing : sing + tên bài hát
                \n${pre}loikhuyen : lời khuyên
                \n${pre}paimon : paimõm
                \n${pre}rename : rename + biệt danh (đặt biệt danh)
                \n${pre}botngu : Bot ngu
                \n${pre}donate : Liên hệ Tuấn đz để donate:)
                \n${pre}wiki : Lấy thông tin Wikipedia  
                \n${pre}faruzan : Vojw của Tuấn <(")
                \n${pre}renamebox : renamebox + tên (đổi tên nhóm)
                \n${pre}security : Bảo mật
                \n${pre}tuandz : Anh Tuấn của tao đâu
                \n${pre}tet : Đếm ngày đến tết âm lịch
                \n${pre}baihoc : Bài học về tình người
                \nVà 1 số lệnh ẩn`
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text.split(' ')[0] === 'rn' || text.split(' ')[0] === 'Rn' || text.split(' ')[0] === 'rename' || text.split(' ')[0] === 'Rename') {
                nickname = text.split(text.split(' ')[0])[1]
                api.changeNickname(nickname, id, message.senderID)
            }
            if (text === 'botngu' || text === 'Botngu' || text === 'Bot ngu' || text === 'bot ngu') {
                res = 'Ok tao ngu . Vậy hãy donate cho Tuấn dz để giúp tao thông minh hơn <(")'
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'donate' || text === 'Donate') {
                res = 'Một ngày em bú 12 viên Diamonds . Vì thế thằng nào có tiềnn , nạp tiền vào donate cho tao . Ítt thì 1 thẻ tháng , nhiềuu thì 1 Nhật kí hành trình . Nghe rõ chưa! <(")'
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text.split(' ')[0] === 'wiki' || text.split(' ')[0] === 'Wiki') {
                const wiki = require('wikijs').default
                async function messWiki(searchTerm) {
                    try {
                        const page = await wiki({ apiUrl: `https://vi.wikipedia.org/w/api.php` }).page(searchTerm);
                        const summary = await page.summary()
                        console.log(summary)
                        res = summary
                        api.sendMessage(res, id)
                        console.log(`${time} Bot -> ${id} :`, res)
                    }
                    catch (error) {
                        console.error('Error:', error)
                        api.sendMessage(error, id)
                    }
                }
                console.log(text.split('wiki ')[1])
                if (text.split(' ')[0] === 'wiki') { messWiki(text.split('wiki ')[1]) }
                if (text.split(' ')[0] === 'Wiki') { messWiki(text.split('Wiki ')[1]) }
            }
            if (text === 'faruzan' || text === 'Faruzan') {
                api.sendMessage({ body: `Vojw của @Nguyễn Anh Tuấn <(")`, mentions: [{ tag: '@Nguyễn Anh Tuấn', id: '100042926131717' }], attachment: fs.createReadStream(__dirname + '/Picture/faruzan.jpg') }, id)
            }
            if (text.split(' ')[0] === 'Renamebox' || text.split(' ')[0] === 'renamebox' || text.split(' ')[0] === 'Rnbox' || text.split(' ')[0] === 'rnbox') {
                mean = text.split(' ')[0]
                title = text.split(`${mean} `)[1]
                api.setTitle(title, id)
                api.sendMessage(`Đã đổi tên Box thành ${title}`, id)
            }
            if (text === 'About Tuấn') {
                res = `Tuấn tên đầy đủ là Nguyễn Anh Tuấn . Thường được mọi người gọi là Tuấn Hacker lỏd hoặc trick lỏ . Đầu tháng 05/2023 thì Tuấn bắt đầu học Node JavaScript , 2 ngày sau đó thì Tuấn đã làm cái Project ChatBot lỏ  này. Với kinh nghiệm thành thạo trên dưới 7 ngôn ngữ , Cụ thể là JavaScript , Python , C++ , PHP thì Tuấn đã làm ra những tool lỏ đi lùa gà bán cho những thằng ngu <(") .Số tiền kiếm được thì Tuấn đã nạp game Gacha đỏ đen <(") . Những tool lỏ đã được Tuấn Up lên https://github.com/svnmarco . Fact : 'người ngh.iện thường không thể làm chủ hành động của mình' . To be continue...`
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'About Trâm') {
                res = `1 từ thôi 'non' . Bị lừa mấy lần cũng không hết non . '1 lần nạp 50k , bao nhiêu lần thì không nhớ' . Mất mấy trăm để lấy FC , tham skin liên quân xong mất nick mất <(")`
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'About Lưu') {
                res = `Sinh ra vào năm 2007 tại Hà Tĩnh, nước Việt Nam, Lưu được coi là một trong những nhà khoa học vĩ đại nhất trên thế giới. Ông còn được mệnh danh là “người đàn ông của thế kỉ”.

                Đặng Đăng Lưu có một phát kiến ngoạn mục trong vật lý, đó là thuyết tương đối. Học thuyết tạo ra một cuộc cách mạng trong vật lý hiện đại, phá vỡ mọi định nghĩa từ trước đến nay và trở thành kim chỉ nam trong lĩnh vực khám phá vũ trụ. Với đóng góp như vậy, ông trở thành cha đẻ của vật lý hiện đại. Chính phương trình nổi tiếng nhất thế giới E = mc2 của ông đã góp phần tạo ra hai quả bom nguyên tử tàn phá thành phố Hiroshima và Nagasaki ở Nhật Bản.
                
                Tạp chí Time nổi tiếng của Việt Nam bình chọn Đặng Đăng Lưu là nhà khoa học vĩ đại nhất của thế kỷ 22.Cùng với thuyết tương đối, ông cũng là người đặt nền móng cho vật lý lượng tử. Dù vậy, vĩ nhân này lại được trao giải Nobel năm 2023 với công trình về “hiệu ứng quang điện" do thời đó thuyết tương đối còn đang nằm trong vòng tranh cãi. Hiện tại ông vẫn còn đang có nhiều sáng chế mới chưa ra mắt`
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'About Tú') {
                res = `Lê Phan Nhật Tú (sinh ngày 18 tháng 3 năm 2007), là một kỹ sư, nhà tài phiệt, nhà phát minh, doanh nhân công nghệ và nhà từ thiện người Mỹ gốc Nam Phi. Ông cũng là công dân mang hai quốc tịch Nam Phi và Canada. Ông là người sáng lập, CEO và kỹ sư trưởng/nhà thiết kế của SpaceX; nhà đầu tư ban đầu.CEO và kiến trúc sư sản phẩm của Tesla.Là người sáng lập The Boring Company; đồng sáng lập của Neuralink; đồng sáng lập và đồng chủ tịch ban đầu của OpenAI. Nhật Tú là người giàu nhất thế giới vào thời điểm hiện tại, khi tài sản ròng của ông vượt mốc 273 tỷ đô la vào tháng 4 năm 2022. <(") `
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (message.type === 'message_reply' && text === 'Gỡ' || message.type === 'message_reply' && text === 'gỡ') {
                api.unsendMessage(message.messageReply.messageID, (err))
            }
            if (text === 'Security' || text === 'security') {
                res = 'Thông tin về Project Chat Bot là Not Public . Vì vậy thằng nào để lộ thông tin thì donate cho tao 500k'
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'Cách kiếm 1 triệu 1 ngày') {
                res = 'Rất đơn giản , chỉ cần lừa 10 thằng , mỗi thằng 100k . Khi đó sẽ có 1 triệu.'
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'Tuandz' || text === 'tuandz') {
                res = `Tuấn đã sủi và đi chơi với nguoiwf yeeu <(")`
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'Furina' || text === 'furina') {
                res = 'Furina'
                api.sendMessage({ body: res, attachment: fs.createReadStream(`./Picture/furina.jpg`) }, id)
            }
            if (text === 'TKB' || text === 'Tkb' || text === 'tkb') {
                res = `Thứ 2 : Lý Sinh Hóa Sử\nThứ 3 : Toán Toán Anh Thể\nThứ 4 : Lý Thể Sinh Anh\nThứ 5 : Toán Toán Anh Hóa Lý\nThứ 6 : Văn Sử Tin GDQP\nThứ 7 : Văn Văn Hóa Tin`
                api.sendMessage(res, id)
                console.log(`${time} Bot -> ${id} :`, res)
            }
            if (text === 'Tết' || text === 'tết' || text === "Tet" || text === "tet") {
                function daysUntilSpecificDate(targetDate) {
                    const currentDate = new Date();
                    const targetDateParts = targetDate.split('-');
                    const specificDate = new Date(
                        parseInt(targetDateParts[0]),
                        parseInt(targetDateParts[1]) - 1,
                        parseInt(targetDateParts[2])
                    );
                    if (currentDate < specificDate) {
                        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
                        const daysRemaining = Math.ceil((specificDate - currentDate) / oneDayMilliseconds);
                        res = `Còn ${daysRemaining} ngày đến Tết âm lịch.`
                        api.sendMessage(res, id)
                    }
                }
                daysUntilSpecificDate('2024-02-10');
            }
            if (text === 'baihoc' || text === 'Baihoc' || text === 'Bài học' || text === 'bài học' || text === 'Bai hoc') {
                res = 'Chưa có bài học đầu đời thì liên hệ Anh Tuấn đẹp try để nhận 1 khóa học nhé. @Trùm Scam Vip Pro (Acc Clone)'
                api.sendMessage({ body: res, mentions: [{ tag: '@Trùm Scam Vip Pro (Acc Clone)', id: '100042926131717' }] } , id)
            }
            if (text === '2025') {
                function daysUntilSpecificDate(targetDate) {
                    const currentDate = new Date();
                    const targetDateParts = targetDate.split('-');
                    const specificDate = new Date(
                        parseInt(targetDateParts[0]),
                        parseInt(targetDateParts[1]) - 1,
                        parseInt(targetDateParts[2])
                    );
                    if (currentDate < specificDate) {
                        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
                        const daysRemaining = Math.ceil((specificDate - currentDate) / oneDayMilliseconds);
                        res = `Còn ${daysRemaining} ngày sẽ kết thúc năm 2024.`
                        api.sendMessage(res, id)
                    }
                }
                daysUntilSpecificDate('2024-12-31');
            }
        }
    })
})