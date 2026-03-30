-- Sample Chinese Vocabulary Data
-- Run this SQL in your Supabase SQL Editor to add sample vocabulary

INSERT INTO vocabulary (hanzi, pinyin, meaning_vi, example_sentence, example_pinyin, chunk, chunk_pinyin, hsk_level) VALUES
('你好', 'nǐ hǎo', 'Xin chào', '你好，很高兴认识你。', 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.', '你好吗？', 'Nǐ hǎo ma?', 1),
('谢谢', 'xièxie', 'Cảm ơn', '谢谢你的帮助。', 'Xièxie nǐ de bāngzhù.', '非常感谢', 'fēicháng gǎnxiè', 1),
('再见', 'zàijiàn', 'Tạm biệt', '再见，明天见。', 'Zàijiàn, míngtiān jiàn.', '回头见', 'huítóu jiàn', 1),
('学习', 'xuéxí', 'Học tập', '我每天都学习中文。', 'Wǒ měitiān dōu xuéxí zhōngwén.', '努力学习', 'nǔlì xuéxí', 1),
('朋友', 'péngyou', 'Bạn bè', '他是我的好朋友。', 'Tā shì wǒ de hǎo péngyou.', '交朋友', 'jiāo péngyou', 1),
('喜欢', 'xǐhuan', 'Thích', '我很喜欢学中文。', 'Wǒ hěn xǐhuan xué zhōngwén.', '非常喜欢', 'fēicháng xǐhuan', 1),
('工作', 'gōngzuò', 'Công việc, làm việc', '我在公司工作。', 'Wǒ zài gōngsī gōngzuò.', '找工作', 'zhǎo gōngzuò', 1),
('时间', 'shíjiān', 'Thời gian', '现在是什么时间？', 'Xiànzài shì shénme shíjiān?', '有时间', 'yǒu shíjiān', 1),
('吃饭', 'chīfàn', 'Ăn cơm', '我们一起去吃饭吧。', 'Wǒmen yìqǐ qù chīfàn ba.', '吃午饭', 'chī wǔfàn', 1),
('电话', 'diànhuà', 'Điện thoại', '我给你打电话。', 'Wǒ gěi nǐ dǎ diànhuà.', '打电话', 'dǎ diànhuà', 1),
('名字', 'míngzi', 'Tên', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', '我的名字', 'wǒ de míngzi', 1),
('认识', 'rènshi', 'Quen biết', '很高兴认识你。', 'Hěn gāoxìng rènshi nǐ.', '认识新朋友', 'rènshi xīn péngyou', 1),
('可以', 'kěyǐ', 'Có thể', '你可以帮我吗？', 'Nǐ kěyǐ bāng wǒ ma?', '可以试试', 'kěyǐ shìshi', 1),
('明白', 'míngbai', 'Hiểu', '我明白你的意思。', 'Wǒ míngbai nǐ de yìsi.', '听明白', 'tīng míngbai', 2),
('努力', 'nǔlì', 'Nỗ lực', '我会努力学习。', 'Wǒ huì nǔlì xuéxí.', '努力工作', 'nǔlì gōngzuò', 2),
('成功', 'chénggōng', 'Thành công', '祝你成功！', 'Zhù nǐ chénggōng!', '取得成功', 'qǔdé chénggōng', 2),
('机会', 'jīhuì', 'Cơ hội', '这是一个好机会。', 'Zhè shì yí gè hǎo jīhuì.', '抓住机会', 'zhuāzhù jīhuì', 2),
('经验', 'jīngyàn', 'Kinh nghiệm', '他有很多工作经验。', 'Tā yǒu hěn duō gōngzuò jīngyàn.', '丰富经验', 'fēngfù jīngyàn', 2),
('文化', 'wénhuà', 'Văn hóa', '中国文化很有意思。', 'Zhōngguó wénhuà hěn yǒuyìsi.', '传统文化', 'chuántǒng wénhuà', 2),
('重要', 'zhòngyào', 'Quan trọng', '这个问题很重要。', 'Zhège wèntí hěn zhòngyào.', '非常重要', 'fēicháng zhòngyào', 2);
