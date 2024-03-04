INSERT INTO AbsorbRules (id, name, type, url, rule)
VALUES (1, 'VOA - Technology', 'RSS2.0', 'https://www.voanews.com/api/zyritequir', '{"contentSelector": ".wsw > p"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO Channels (id, absorbRuleId, title, url, thumbnailUrl, lastUpdatedAt)
VALUES (1, 1, 'Technology - Voice of America', 'https://www.voanews.com/z/621', 'https://www.voanews.com/Content/responsive/VOA/en-US/img/logo.png', 1709185739)
ON CONFLICT (id) DO NOTHING;

INSERT INTO Entries (id, channelId, url, title, description, content, thumbnailUrl, metadata, publishedAt)
VALUES (1,
				1,
				'https://www.voanews.com/a/china-users-on-banned-social-platforms-need-protection-advocates-say/7505043.html',
				'China Users on Banned Social Platforms Need Protection, Advocates Say',
				'washington — Rights advocates are urging international social media platforms to do more to prevent Chinese authorities from obtaining the personal information of users. The call comes after two popular Chinese social media influencers alleged on X and YouTube that police in China were investigating their followers and had called some in for questioning. Social media platforms such as X and YouTube and thousands of websites — from The New York Times to the BBC and VOA — are blocked in China by the country''s Great Firewall. But increasingly, even as social controls tighten under the leadership of Xi Jinping, many in China are using virtual private networks to access X, YouTube and other sites for news, information and opinions not available in China. Li Ying, who is also known online as Teacher Li, is one of the social media influencers who issued the warning on Sunday. Li came to prominence as a source of news and information following a rare display of public dissent in 2022 in China, protesting the government''s draconian zero-COVID policy. His account on X has now become a hub for news and videos provided by netizens that the Chinese government considers sensitive and censors online. In a post on Sunday, Teacher Li said, "Currently, the public security bureau is checking my 1.6 million followers and people in the comments, one by one." He shared screenshots of private messages he received from followers over the past few months, some of which claimed that police had interrogated individuals, even causing one person to lose their job. VOA could not independently verify the authenticity of the claims, but court records in China and reports by rights groups have previously documented the country''s increasing use of social media platforms banned in China to detain, prosecute and sentence individuals over comments made online. The Chinese Embassy spokesperson in Washington, Liu Pengyu, said he was not aware of the specifics regarding the social media influencers. "As a principle, the Chinese government manages internet-related affairs according to law and regulation," Liu said. Influencers warn followers News of the crackdown on followers of social influencers comes amid a flurry of reports about China''s hacking capabilities. Last week, FBI Director Christopher Wray warned that cyberattacks on U.S. infrastructure were "at a scale greater than we''d seen before." A recent document dump detailed how private companies are helping China to hack foreign governments across Southeast Asia and to unmask users of foreign social media accounts. Wang Zhi''an, a former journalist at China''s state broadcaster CCTV who has a million subscribers on X and 1.2 million followers on YouTube, says his followers have reported similar problems. In response, both Wang and Teacher Li have urged their followers to take precautions, suggesting they unfollow their accounts, change their usernames, avoid Chinese-made phones and prepare to be questioned. As of Tuesday afternoon, Li''s followers on X had dropped to 1.4 million. VOA reached out to Li for comment but did not receive a response as of publication. Authorities reportedly tracking followers Maya Wang, acting China director at Human Rights Watch, said China is putting more effort into policing platforms based outside of the country as more Chinese people move to the platforms to speak out. She said the recent reports of authorities tracking down followers is just a part of China''s long-standing effort to restrict freedom of expression. "I think the Chinese government is also increasingly worried about the information that is being propagated, transmitted or distributed on these foreign platforms because they have been, thanks to these individuals, very influential," Wang said. A recent leak of documents from I-Soon, a private contractor linked to China''s top policing agency and other parts of its government, described tools used by Chinese police to curb dissent on overseas social media, including one tool specifically created to surveil users on X. Hackers also created tools for police to hack email inboxes and unmask anonymous users of X, the documents show. The leak revealed that officers sometimes sent requests to surveil specific individuals to I-Soon. Wang said it is incumbent on social media companies to make sure their users stay safe. "I would want to direct these questions to Twitter [X] to ask — are they adopting heightened measures to protect PRC [People''s Republic of China]-based users?" she said. "I think Twitter [X] needs to investigate just how exactly this kind of information is being obtained and whether or not they need to plug some loopholes." Yaqiu Wang, research director for China, Hong Kong and Taiwan at Freedom House, said that besides better protecting their users'' privacy, the companies should also put in more effort to combat China''s clampdown on freedom of speech. "They should have steps actually helping out activists to protect their freedom of speech," she said. "Big social media companies should widely disseminate information to their users, like a manual or instructions of how to protect their account. "They need to be more transparent, so users and the public know whether government-sponsored hacking activities are going on," she added. VOA reached out to X, formerly known as Twitter, several times for comment but did not receive any response by the time of publication. Xiao Yu contributed to this report.',
				'[{"type":"paragraph","key":"bb4ecc32bb6cd940edf3d6a415669cb181cab4566a010189cfc8cf3dd473f0df","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"59c260539c8092d950a378b267c4e9318560c37cf79595f16b4080d515b7f107","text":"Rights advocates are urging international social media platforms to do more to prevent Chinese authorities from obtaining the personal information of users. ","translation":"権利擁護団体は、ソーシャルメディアのプラットフォームに対し、中国当局がユーザーの個人情報を取得するのを防ぐために、より多くの措置を講じるよう促している。","duration":null,"offset":null},{"type":"sentence","key":"f631494c6069b1707b596d33ee332192612705a34de83b6613636effed7827aa","text":"The call comes after two popular Chinese social media influencers alleged on X and YouTube that police in China were investigating their followers and had called some in for questioning.","translation":"電話は、中国のソーシャルメディアの2人の影響力がXとYouTubeで、中国の警察がフォロワーを捜査し、何人かを尋問するために呼んでいたと主張した後に来た。","duration":null,"offset":null}]},{"type":"paragraph","key":"efb561769370149c9b95304626ff3d064a5bfc87fe2e0f693580b4b6a9b5aa43","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"4b0a039d692b1581fe903fa3133d0ccc799ca9df9edc867aef8be690dea74ca3","text":"Social media platforms such as X and YouTube and thousands of websites — from The New York Times to the BBC and VOA — are blocked in China by the country''s Great Firewall. ","translation":"XやYouTubeなどのソーシャルメディアプラットフォームや、ニューヨーク・タイムズからBBCやVOAまで数千のウェブサイトが、中国の大ファイアウォールによってブロックされています。","duration":null,"offset":null},{"type":"sentence","key":"78b54cb253be597cfc7e843a912acdb0c3d1c031435cf40163ba790054506a2b","text":"But increasingly, even as social controls tighten under the leadership of Xi Jinping, many in China are using virtual private networks to access X, YouTube and other sites for news, information and opinions not available in China.","translation":"しかし、習近平の指導の下で社会的コントロールが厳しくなる一方で、中国の多くの人々は、X、YouTube、その他のサイトにアクセスするために、仮想プライベートネットワークを使用して、中国で利用できないニュース、情報、意見を見つけるようになっています。","duration":null,"offset":null}]},{"type":"paragraph","key":"225b2eb2f900197afd7649b0fda63c5c5bce7e95b908def2317f628e07d20638","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"0263067e60897212cecdfd31658c9d26d52882c070d0f3a1cff5c384c2419dee","text":"Li Ying, who is also known online as Teacher Li, is one of the social media influencers who issued the warning on Sunday. ","translation":"オンラインで「教師リー」とも呼ばれるリー・イングは、日曜日に警告を出したソーシャルメディアの影響力者の一人です。","duration":null,"offset":null},{"type":"sentence","key":"8238198d8a5e5e5764711767f71664ff2b505b3cd94972e2e4c2cd68cb689fb3","text":"Li came to prominence as a source of news and information following a rare display of public dissent in 2022 in China, protesting the government''s draconian zero-COVID policy. ","translation":"李氏は、政府のゼロCOVID政策に抗議して、2022年に中国で一般の反対の希少な表現の後、ニュースと情報の源として顕著になった。","duration":null,"offset":null},{"type":"sentence","key":"382572db0f12bf1aa0d1edce487e166f821f5a2c007d6f6df47fad33657608df","text":"His account on X has now become a hub for news and videos provided by netizens that the Chinese government considers sensitive and censors online.","translation":"彼のXのアカウントは、中国政府が機密とし、オンラインで検閲しているネットユーザーが提供するニュースやビデオのハブとなった。","duration":null,"offset":null}]},{"type":"paragraph","key":"5daaa262ae001ac8b29aa91c75fcacd8a56191993793fb8f26acb5d09998917d","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"5daaa262ae001ac8b29aa91c75fcacd8a56191993793fb8f26acb5d09998917d","text":"He shared screenshots of private messages he received from followers over the past few months, some of which claimed that police had interrogated individuals, even causing one person to lose their job.","translation":"彼は、過去数ヶ月間にフォロワーから受け取ったプライベートメッセージのスクリーンショットを共有し、そのうちのいくつかは、警察が個人を尋問したと主張し、ある人が仕事を失うことさえした。","duration":null,"offset":null}]},{"type":"paragraph","key":"818378dac1fb13d242ef275494bb3ca121f4427fd7fb120dc7852d14d6aec377","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"818378dac1fb13d242ef275494bb3ca121f4427fd7fb120dc7852d14d6aec377","text":"VOA could not independently verify the authenticity of the claims, but court records in China and reports by rights groups have previously documented the country''s increasing use of social media platforms banned in China to detain, prosecute and sentence individuals over comments made online.","translation":"VOAは主張の真実性を独立して検証することはできなかったが、中国の裁判所の記録と権利団体の報告は、中国で禁止されているソーシャルメディアプラットフォームの使用を増加させ、オンラインで投稿されたコメントで個人を拘束、起訴し、判決を下したことを以前にも記録している。","duration":null,"offset":null}]},{"type":"paragraph","key":"b53b643d4ee21bb6777a507da9661242fafe62c67edce5a6f8c23b220edc7fb2","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"b53b643d4ee21bb6777a507da9661242fafe62c67edce5a6f8c23b220edc7fb2","text":"The Chinese Embassy spokesperson in Washington, Liu Pengyu, said he was not aware of the specifics regarding the social media influencers.","translation":"ワシントンにある中国大使館のリュー・ペンギュ(Liu Pengyu)報道官は、ソーシャルメディアの影響力者に関する詳細を知らないと述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"2b599128ff5a2b5acfe1916637cecb37128d02b7bc576762b94be8aaf00b51af","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"2b599128ff5a2b5acfe1916637cecb37128d02b7bc576762b94be8aaf00b51af","text":"\"As a principle, the Chinese government manages internet-related affairs according to law and regulation,\" Liu said.","translation":"「原則として、中国政府は法律と規制に従ってインターネット関連の問題を管理している」と劉氏は述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"b9f4bcf6a7b6004ee87d9d2549630b7d32b23656c393db2b744e6533ed23bd21","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"b9f4bcf6a7b6004ee87d9d2549630b7d32b23656c393db2b744e6533ed23bd21","text":"A recent document dump detailed how private companies are helping China to hack foreign governments across Southeast Asia and to unmask users of foreign social media accounts.","translation":"最近のドキュメントは、民間企業が中国が東南アジアの外国政府をハッキングし、外国のソーシャルメディアアカウントのユーザーを解き明かすのをどのように支援しているかを詳細に説明しています。","duration":null,"offset":null}]},{"type":"paragraph","key":"841bf417b6ee10d6469e96d2e64402625570a5f597d3528178cd34fd0a88c510","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"841bf417b6ee10d6469e96d2e64402625570a5f597d3528178cd34fd0a88c510","text":"Wang Zhi''an, a former journalist at China''s state broadcaster CCTV who has a million subscribers on X and 1.2 million followers on YouTube, says his followers have reported similar problems.","translation":"中国の国営放送局CCTVの元ジャーナリストであるWang Zhi''an氏は、Xに100万人のサブスクリプトとYouTubeに120万人のフォロワーを持っていると、彼のフォロワーは同様の問題を報告していると述べている。","duration":null,"offset":null}]},{"type":"paragraph","key":"7a571b6c844284a836e9f7e176441544a992acb740d70a7e96669b0b81b86621","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"7a571b6c844284a836e9f7e176441544a992acb740d70a7e96669b0b81b86621","text":"In response, both Wang and Teacher Li have urged their followers to take precautions, suggesting they unfollow their accounts, change their usernames, avoid Chinese-made phones and prepare to be questioned.","translation":"答えとして、王と李教授は、彼らのフォロワーに注意を払い、彼らのアカウントを追跡しないようにし、ユーザーネームを変更し、中国製の携帯電話を避け、質問される準備をするよう促した。","duration":null,"offset":null}]},{"type":"paragraph","key":"352535b3514aa241aebc5c5cf9f6a497efcd960b5589c5c6e83cd64ad650e17e","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"b4165ccd9ee576757d13c1a6d3026d55388ee7fdb4955f99b596ed797853f09e","text":"As of Tuesday afternoon, Li''s followers on X had dropped to 1.4 million. ","translation":"火曜日の午後、LiのXのフォロワー数は1400万人に減少した。","duration":null,"offset":null},{"type":"sentence","key":"e13d2434ba495def2a17db6ae3e1c6356892f98d63201ce323efd72783ed8e54","text":"VOA reached out to Li for comment but did not receive a response as of publication.","translation":"VOAはLiにコメントを求めたが、公表時点では回答を受け取らなかった。","duration":null,"offset":null}]},{"type":"paragraph","key":"5b01dd458753be02ba84b88b833fdc0c5058e77e4332ea0a0279724959ac9d06","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"5b01dd458753be02ba84b88b833fdc0c5058e77e4332ea0a0279724959ac9d06","text":"Maya Wang, acting China director at Human Rights Watch, said China is putting more effort into policing platforms based outside of the country as more Chinese people move to the platforms to speak out.","translation":"ヒューマン・ライツ・ウォッチ(Human Rights Watch)の中国役員ディレクターであるマヤ・ワン(Maya Wang)氏は、中国は、より多くの中国人が発言するためにプラットフォームに移動するにつれて、国内外に拠点を置く警察プラットフォームにより多くの努力をかけていると述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"68d3bf2d1e54780111527cac29211228051c2a05bbffa0f46970be86fb078f27","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"68d3bf2d1e54780111527cac29211228051c2a05bbffa0f46970be86fb078f27","text":"She said the recent reports of authorities tracking down followers is just a part of China''s long-standing effort to restrict freedom of expression.","translation":"フォロワーを追跡する当局の最近の報道は、言論の自由を制限する中国の長期的な努力の一部にすぎないと彼女は述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"2ea0790415903f7f6f9c9b6f6b115b87d9c6fa260dd999d82acdb271c9b99c83","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"2ea0790415903f7f6f9c9b6f6b115b87d9c6fa260dd999d82acdb271c9b99c83","text":"\"I think the Chinese government is also increasingly worried about the information that is being propagated, transmitted or distributed on these foreign platforms because they have been, thanks to these individuals, very influential,\" Wang said.","translation":"「中国政府も、これらの外国のプラットフォームで広められ、送信され、配布されている情報についてますます懸念しているのは、これらの個人のおかげで非常に影響力があるからだ」と王氏は述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"e4094f66350b8a8dc701e475ba5d9029927ca708a358c9a4c5da7ca4a77315d0","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"e4094f66350b8a8dc701e475ba5d9029927ca708a358c9a4c5da7ca4a77315d0","text":"A recent leak of documents from I-Soon, a private contractor linked to China''s top policing agency and other parts of its government, described tools used by Chinese police to curb dissent on overseas social media, including one tool specifically created to surveil users on X.","translation":"中国のトップの警察機関とその政府の他の部門と関連する民間契約者であるI-Soonからの最近の文書の流出は、中国の警察が海外のソーシャルメディアでの反対を抑制するために使用するツールを説明し、Xのユーザーを監視するために特別に作成されたツールを含む。","duration":null,"offset":null}]},{"type":"paragraph","key":"fc5a0c002ae264ba9fdcd29fd4c8ee144112b67f914c37272fcd5152da85165d","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"2371103df6e1738d808457aad97da785013b523815fef01fae89db5ea169aea7","text":"Hackers also created tools for police to hack email inboxes and unmask anonymous users of X, the documents show. ","translation":"ハッカーはまた、警察がメールインボックスをハッキングし、Xの匿名ユーザーを解き明かすためのツールを作成しました。","duration":null,"offset":null},{"type":"sentence","key":"735bb8cc8db2e899baf91c4f3b49a59ad601b45fe3285a7e04cbfa24a0a903b1","text":"The leak revealed that officers sometimes sent requests to surveil specific individuals to I-Soon.","translation":"情報漏えいは、警察官が時には特定の個人を監視するようI-Soonに要請を送ったことを明らかにした。","duration":null,"offset":null}]},{"type":"paragraph","key":"aa834e0aa32057407dd308886c0d11e9210d9818869141b4712a27f120fc6130","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"aa834e0aa32057407dd308886c0d11e9210d9818869141b4712a27f120fc6130","text":"Wang said it is incumbent on social media companies to make sure their users stay safe.","translation":"王氏は、ソーシャルメディア企業がユーザーを安全に保つことを保証する責任があると述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"da0831502409175dcb4b8e7dd0cdc571e113d9de2e9300baf06810ebe8fba1dc","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"da0831502409175dcb4b8e7dd0cdc571e113d9de2e9300baf06810ebe8fba1dc","text":"Yaqiu Wang, research director for China, Hong Kong and Taiwan at Freedom House, said that besides better protecting their users'' privacy, the companies should also put in more effort to combat China''s clampdown on freedom of speech.","translation":"フリーダムハウスの中国、香港、台湾の研究ディレクターであるヤキウ・ワン氏は、ユーザーのプライバシーをより良く保護するほか、企業は言論の自由に対する中国の抑制に対抗するためにさらに努力すべきだと述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"18ff8e529dee16f628026f22dba8a840921ec251247b21a021cb41220dedfcd5","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"07c1acbc674ba690bfb2788525d0aff144e983a73baf3b7db868198510053942","text":"\"They should have steps actually helping out activists to protect their freedom of speech,\" she said. ","translation":"「彼らは活動家が言論の自由を守るのを実際に助けるための措置を取るべきだ」と彼女は言った。","duration":null,"offset":null},{"type":"sentence","key":"bec7210130d77c7585762a814715eb29160b9ecd66cf0ec4a3d5a4acbb49de38","text":"\"Big social media companies should widely disseminate information to their users, like a manual or instructions of how to protect their account.","translation":"「大手ソーシャルメディア企業は、ユーザーにマニュアルやアカウントを保護するための指示のような情報を広く広めなければなりません。","duration":null,"offset":null}]},{"type":"paragraph","key":"ea003ddaa56f0b5840fe4cb8a7733d6fe55449c1b19e0521fdc5cf822bc710ac","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"ea003ddaa56f0b5840fe4cb8a7733d6fe55449c1b19e0521fdc5cf822bc710ac","text":"\"They need to be more transparent, so users and the public know whether government-sponsored hacking activities are going on,\" she added.","translation":"「彼らはより透明でなければならないので、ユーザーと一般の人々は、政府が支援するハッキング活動が行われているかどうかを知っている」と彼女は付け加えた。","duration":null,"offset":null}]},{"type":"paragraph","key":"4c1892ad09df9ae7ae1adeec4ee21fd2c4aacaa0f44e56738780e667db068469","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"4c1892ad09df9ae7ae1adeec4ee21fd2c4aacaa0f44e56738780e667db068469","text":"VOA reached out to X, formerly known as Twitter, several times for comment but did not receive any response by the time of publication.","translation":"VOAは、以前はTwitterとして知られていたXに複数回コメントを求めたが、公開時点では何の回答も受け取らなかった。","duration":null,"offset":null}]},{"type":"paragraph","key":"24ddfdb85ec9a9b5870a4d7a8c317cce45da041b91dd3570e1beb5aa81c341e6","offset":null,"duration":null,"sentences":[{"type":"sentence","key":"24ddfdb85ec9a9b5870a4d7a8c317cce45da041b91dd3570e1beb5aa81c341e6","text":"Xiao Yu contributed to this report.","translation":"Xiao Yuはこの報告に貢献しました。","duration":null,"offset":null}]}]',
				'https://gdb.voanews.com/01000000-0aff-0242-c9e2-08dbffcdfd97_w800_h450.jpg',
				'{"category":["China News","East Asia","Technology"],"author":"webdesk@voanews.com (Adrianna Zhang)"}',
        1709072305),
			 (2,
				1,
				'https://www.voanews.com/a/odysseus-moon-lander-likely-has-10-to-20-hours-of-battery-life-left-company-says-/7504618.html',
				'Odysseus Moon Lander Likely Has 10 to 20 Hours of Battery Life Left, Company Says',
				'',
				'[{"type":"paragraph","key":"8bc4fc9b137f0e6a75aae62b8d755655a50f2c8eaa25a1b4747749e90137446c","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"8bc4fc9b137f0e6a75aae62b8d755655a50f2c8eaa25a1b4747749e90137446c","text":"Odysseus, the first U.S. spacecraft to land on the moon since 1972, has roughly 10 to 20 hours of battery life left, according to flight controllers who are still in contact with the robot lander.","translation":"1972年以来、月面に着陸した最初の米国の宇宙船であるオディセウスは、ロボット着陸機と接触しているフライトコントローラによると、バッテリー寿命が約10〜20時間残っている。","duration":null,"offset":null}]},{"type":"paragraph","key":"d30428647d21139e2375537d957593ee311bc6f238634f40cbfc3f752b515d31","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"fbbf73eea579e83db8ff81a66a21c9f983c289d4be0e0e86e9b4759fb55d4be0","text":"Texas-based Intuitive Machines said on Tuesday its flight controllers were in touch with the Odysseus moon lander and the spacecraft had relayed payload science data and imagery in the morning. ","translation":"テキサスに拠点を置くIntuitive Machinesは火曜日に、そのフライトコントローラが月面着陸機Odisseusと接触しており、宇宙船は午前中に有用な科学データと画像を転送したと述べた。","duration":null,"offset":null},{"type":"sentence","key":"a509f9c297c39717b8e52f7eb4672d62fa40e1c2b2daf2583c9cfeef7a8ac4a4","text":"NASA paid Intuitive $118 million to build and fly the spacecraft to the moon, carrying science instruments for the U.S. space agency and several commercial customers.","translation":"NASAはIntuitiveに1億1800万ドルを支払い、宇宙船を月へ運び、米国の宇宙機関といくつかの商業顧客のための科学楽器を運ぶ。","duration":null,"offset":null}]},{"type":"paragraph","key":"ed34c2c7f042313e43e12a367efc18155e2de6ae9a81a3a5afd62fd392ccd571","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"c4e241c81bb918cad26cf5ec2a8a1a940e3a4e88629af8f8c38b5ac21c3a885f","text":"The craft landed on Friday, but its timetable for seven to 10 days of operation was expected to be cut short after a sideways touchdown. ","translation":"艦は金曜日に着陸したが、7〜10日間の運用スケジュールは横向きのタッチダウンの直後に短縮される見通しだった。","duration":null,"offset":null},{"type":"sentence","key":"c69b25fe9f2faf237485a742aed66e1b2c5c9f1d2935838d2ca7ff2b464660c4","text":"The company is still working on the final determination of the battery life of the lander, Intuitive said.","translation":"同社はまだ着陸機のバッテリー寿命の最終決定に取り組んでいるとIntuitiveは述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"d6a4d261151d14cf422c5907ce5e91e6e3c7603b65da3cac10cb690f35dc73d1","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"b2898e9e78ee861ef5996f46714a385598393a0a77ba18fdd03cbe32d2a317d1","text":"The company''s shares were down 16% on Tuesday, paring some losses after Intuitive said it was still in touch with the lander. ","translation":"同社の株は火曜日に16%下落し、Intuitiveはまだ着陸機と接触していると述べた後、いくつかの損失を伴った。","duration":null,"offset":null},{"type":"sentence","key":"af431726535c684abf7ec439291dd6bd622a5b40bdd756d69005a45ea786de1e","text":"Still, the stock had wiped out most of its gain since late last week.","translation":"それでも、株は先週末以来、その利益のほとんどを消し去った。","duration":null,"offset":null}]},{"type":"paragraph","key":"1fe4269b4f4980bd4ae636c8d79f2196ddcc0d43db637e58b405f4d35d6ad262","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"1fe4269b4f4980bd4ae636c8d79f2196ddcc0d43db637e58b405f4d35d6ad262","text":"It remained to be seen how much research data and imagery from various payloads will be uncollected because of Odysseus'' shortened lunar lifespan.","translation":"オディセウスの月の寿命が短縮されたため、さまざまな有益な負荷からの研究データや画像がどれだけ収集されなくなるかはまだ明らかです。","duration":null,"offset":null}]},{"type":"paragraph","key":"34a8b47536ef3cf1e25eb8435d32ef4d451d92b12e9322cf12d275add6d5a265","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"001562a182b135a580641fdfe52ce6e0284d5e857a8fb7b9d38056a2225d2ae6","text":"The Nova-C-class lander was launched on Feb. 15 from NASA''s Kennedy Space Center in Florida on a Falcon 9 rocket supplied by Elon Musk''s SpaceX. ","translation":"Nova-Cクラス着陸機は、FloridaのNASAのケネディ宇宙センターから2月15日に、エロン・マスクのSpaceXが供給するFalcon 9ロケットで打ち上げられた。","duration":null,"offset":null},{"type":"sentence","key":"9acc51f60102beadb46594049351338f44f0e03442ebb28435c0e6e608e5a774","text":"The six-legged vehicle reached lunar orbit six days later.","translation":"月の軌道に到達したのは6日後。","duration":null,"offset":null}]},{"type":"paragraph","key":"7827da1ddf856f44cea63daca7c985fa6ae3c11adcdbc3ec9ee3eb17c13c76d3","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"7827da1ddf856f44cea63daca7c985fa6ae3c11adcdbc3ec9ee3eb17c13c76d3","text":"Odysseus made its final lunar descent and landed the next day, Feb. 22, close to its intended destination in the region of the moon''s south pole, despite an 11th-hour navigational glitch.","translation":"オディセウスは最後の月面着陸を行い、翌日、2月22日、月の南極地域の予定の目的地に近づいて着陸したが、11時間の航行の失敗にもかかわらず。","duration":null,"offset":null}]},{"type":"paragraph","key":"cacefa1455758b941aff9ff2a4f7d9e63e310da66a75a2f7c76f067a647ba7cc","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"cacefa1455758b941aff9ff2a4f7d9e63e310da66a75a2f7c76f067a647ba7cc","text":"Initial radio signals from the spacecraft were unexpectedly faint, confirming the vehicle made it to the surface intact but suggesting something was amiss.","translation":"宇宙船からの初期の無線信号は予想外に弱く、車両を表面に破損させたことを確認したが、何かが間違っていたことを示唆した。","duration":null,"offset":null}]},{"type":"paragraph","key":"d8108c054eeaee3230dea64a89508d1e90ec01c596ceaf6dabd13581bf32bd13","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"d8108c054eeaee3230dea64a89508d1e90ec01c596ceaf6dabd13581bf32bd13","text":"Intuitive executives said on Feb. 23 that engineers had determined that Odysseus had caught the foot of one of its landing legs on the craggy lunar surface as it neared touchdown and tipped over before coming to rest horizontally, apparently propped up on a rock.","translation":"直感的な幹部は2月23日、エンジニアは、オディセウスが月面に接近し、横向きに休む前に、見た目で岩の上に立っているように、着陸の足の1つを捕らえたと判断したと述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"0ad3940706d9ebb03601268ad13f4e33936f37b964dc006e224b7de671619f29","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"0ad3940706d9ebb03601268ad13f4e33936f37b964dc006e224b7de671619f29","text":"Intuitive acknowledged then that the lander''s sideways posture left two of its communications antennae pointed downward, knocking them out of commission, while limiting its solar panels'' exposure to sunlight, and thus the ability to recharge its batteries.","translation":"Intuitiveはその後、着陸機の側面姿勢が2つの通信アンテナを下の方向に置き、それらをコミッションから追い出し、太陽光への太陽電池パネルの曝露を制限し、したがってバッテリーを充電する能力を残したことを認めた。","duration":null,"offset":null}]},{"type":"paragraph","key":"02ae44ec528372667100ea7f9339888d2fff8a6b622a8b45c8fdcbc60c0af567","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"02ae44ec528372667100ea7f9339888d2fff8a6b622a8b45c8fdcbc60c0af567","text":"Company officials said only one of NASA''s six experiments appeared to be physically impinged and that the needs of all the commercial payloads could still be met.","translation":"同社の関係者は、NASAの6つの実験のうち1つだけが物理的に妨げられたように見え、すべての商業的な稼働負荷のニーズはまだ満たされる可能性があると述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"cfe14499c5ec48125e9522aac15a9b469712aa772dd79fa70268d98b713c87e9","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"cfe14499c5ec48125e9522aac15a9b469712aa772dd79fa70268d98b713c87e9","text":"The company on Monday said flight engineers expected Odysseus to go dark on Tuesday morning, once sunlight could no longer reach its solar panels, based on calculations of the positions of the Earth and moon.","translation":"同社は月曜日に、飛行エンジニアは、地球と月の位置の計算に基づいて、太陽光がもはやその太陽パネルに届くことができなくなったときに、火曜日の朝、オディセウスが暗くなると予想していると述べた。","duration":null,"offset":null}]},{"type":"paragraph","key":"d329103f060ab735275bb554a18ad8a7e9763496111fa95fbecb01bbb718b0aa","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"d329103f060ab735275bb554a18ad8a7e9763496111fa95fbecb01bbb718b0aa","text":"Despite its less-than-ideal touchdown, Odysseus became the first U.S. spacecraft to land on the moon since NASA''s last crewed Apollo mission to the lunar surface in 1972.","translation":"理想的ではないにもかかわらず、オディセウスは、1972年のNASAの最後の乗組員アポロミッション以来、月面に着陸した最初の米国の宇宙船となった。","duration":null,"offset":null}]},{"type":"paragraph","key":"7ab0bb530db18668af5440ca68cfbfa027d476a158e548830beca1e9d6916ce8","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"7ab0bb530db18668af5440ca68cfbfa027d476a158e548830beca1e9d6916ce8","text":"It was also the first lunar landing ever by a commercially manufactured and operated space vehicle, and the first under NASA''s Artemis program, which aims to return astronauts to Earth''s natural satellite this decade.","translation":"また、商業的に製造・運用された宇宙船による月面着陸は初めてで、この10年間に宇宙飛行士を地球の天然衛星に戻すことを目的とするNASAのArtemisプログラムの下で初めてでした。","duration":null,"offset":null}]},{"type":"paragraph","key":"4016bf44c2967d8ca126b731f81e8183c72199b7a3aecd1da40238a70f4c3e6e","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"4016bf44c2967d8ca126b731f81e8183c72199b7a3aecd1da40238a70f4c3e6e","text":"The mishaps surrounding the Odysseus mission illustrated anew the risks inherent in NASA''s strategy of leaning more heavily on small, relatively less experienced private ventures than it did during the Apollo era.","translation":"オディセウスミッションを取り巻く不幸は、アポロ時代よりも小さく、比較的経験が少ない民間企業に強く依存するNASAの戦略に固有のリスクを再び示した。","duration":null,"offset":null}]},{"type":"paragraph","key":"890f11ed2af009293e24017ca55328ce7459c08af3975fd3ac73e2fd63fa3aab","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"890f11ed2af009293e24017ca55328ce7459c08af3975fd3ac73e2fd63fa3aab","text":"It came a month after the lunar lander of another U.S. firm, Astrobotic Technology, suffered a propulsion leak on its way to the moon shortly after being placed in order on Jan. 8 by a United Launch Alliance (ULA) Vulcan rocket.","translation":"アストロボティック・テクノロジー(Astrobotic Technology)という別の米国企業の月面着陸機が、1月8日にUnited Launch Alliance(ULA)のVulcanロケットによって配備された直後に、月へ向かう途中、推進装置の漏れを受けた1ヶ月後に発生した。","duration":null,"offset":null}]},{"type":"paragraph","key":"9feb516a5c15b9c67eb63cebac721e028cc14126bdb72afbaac0c877b92b32c9","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"9feb516a5c15b9c67eb63cebac721e028cc14126bdb72afbaac0c877b92b32c9","text":"Japan''s space agency JAXA experienced a setback similar to Odysseus in January with its own SLIM moon lander, which likewise ran out of power after tipping over on the lunar surface, leaving its solar panels at the wrong angle.","translation":"日本の宇宙機関JAXAは、1月に自社のSLIM月面着陸機でオディセウスに似た失敗を経験し、同様に月面に飛び越え、太陽光パネルを間違った角度に置き去りにした後も電力がなくなった。","duration":null,"offset":null}]},{"type":"paragraph","key":"4676420fd03d2b93bac2b8474da3a428405d10e40e4836aa6cc960d12a6cbe6f","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"4676420fd03d2b93bac2b8474da3a428405d10e40e4836aa6cc960d12a6cbe6f","text":"On Monday, however, JAXA reported that its \"pinpoint\" lander had unexpectedly survived a freezing lunar night and re-established communication with Earth, more than a month after arriving on the moon.","translation":"しかし、月曜日、JAXAは、その「ポイント」着陸機が意外に凍った月の夜を生き延び、月に到着してから1カ月以上後に地球との通信を再構築したと報告した。","duration":null,"offset":null}]},{"type":"paragraph","key":"006d2735113685be58f83e00d934650f965f7be7a9220a4d2f0b3b1baeabac38","duration":null,"offset":null,"sentences":[{"type":"sentence","key":"208fc2ca37f610f78cd9c1abe9c27b930b6ab15286470d5668f9068fec790344","text":"Reuters is a news agency founded in 1851 and owned by the Thomson Reuters Corporation based in Toronto, Canada. ","translation":"ロイターは1851年に設立され、トムソン・ロイター・コーポレーション(Thomson Reuters Corporation)が所有しています。","duration":null,"offset":null},{"type":"sentence","key":"3e3270171f1f8b871cf3f4564fba963d629c3e81b9f4b5a9e4fe8aff6c4f8f18","text":"One of the world''s largest wire services, it provides financial news as well as international coverage in over 16 languages to more than 1000 newspapers and 750 broadcasters around the globe.","translation":"世界最大のワイヤレスサービスの1つとして、世界中の1000以上の新聞と750以上の放送局に16以上の言語で金融ニュースと国際的なカバーを提供しています。","duration":null,"offset":null}]}]',
				'https://gdb.voanews.com/01000000-0a00-0242-00c8-08dc37b4c77b_w800_h450.jpg',
				'{"category":["Technology","Science & Health"],"author":"webdesk@voanews.com (Reuters)"}',
				1709053365)
ON CONFLICT DO NOTHING;

