# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: human.spec.ts >> 사람처럼 쓰기 >> 375px: 어느 화면도 옆으로 넘치지 않는다
- Location: tests/human.spec.ts:287:3

# Error details

```
Error: /record: 가로 스크롤 377px > 375px
/record: input.input 210~377px ""

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "/record: 가로 스크롤 377px > 375px",
+   "/record: input.input 210~377px \"\"",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f24e1]:
  - generic [ref=f24e2]:
    - generic [ref=f24e4]:
      - link [ref=f24e5] [cursor=pointer]:
        - /url: /
        - img "보라핀 로고" [ref=f24e6]
        - text: 보라핀
      - article [ref=f24e10]:
        - heading "출처와 버전" [level=1] [ref=f24e11]
        - paragraph [ref=f24e12]: 보라핀 v0.1.0 · 빌드 adc2c95
        - heading "사진·영상" [level=2] [ref=f24e13]
        - paragraph [ref=f24e14]: 앱을 꾸미는 여행지 사진과 영상은 위키미디어 공용(Wikimedia Commons)에서 자유 이용이 허락된 자료를 줄여서 썼습니다. 각 자료의 이용 허락 조건을 따릅니다(CC BY-SA 자료를 줄인 것은 같은 조건으로 나눕니다).
        - list [ref=f24e15]:
          - listitem [ref=f24e16]:
            - text: 제주 성산일출봉 ·
            - link "Seongsan Ilchulbong from the air.jpg" [ref=f24e17] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASeongsan_Ilchulbong_from_the_air.jpg
            - text: · Korea.net / Korean Culture and Information Service · CC BY-SA 2.0
          - listitem [ref=f24e18]:
            - text: 강릉 경포해변 ·
            - link "Gyeongpo Beach 3.jpg" [ref=f24e19] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGyeongpo_Beach_3.jpg
            - text: · Christophe95 · CC BY-SA 4.0
          - listitem [ref=f24e20]:
            - text: 경주 동궁과 월지 ·
            - link "Water reflection of Donggung Palace in Wolji Pond at blue hour in Gyeongju South Korea.jpg" [ref=f24e21] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AWater_reflection_of_Donggung_Palace_in_Wolji_Pond_at_blue_hour_in_Gyeongju_South_Korea.jpg
            - text: · Basile Morin · CC BY-SA 4.0
          - listitem [ref=f24e22]:
            - text: 전주 한옥마을 ·
            - link "Jeonju Hanok Village 20230408 003.jpg" [ref=f24e23] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJeonju_Hanok_Village_20230408_003.jpg
            - text: · Mobius6 · CC BY-SA 4.0
          - listitem [ref=f24e24]:
            - text: 여수 바다 ·
            - link "Yeosu-si, South Korea (Unsplash).jpg" [ref=f24e25] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AYeosu-si%2C_South_Korea_(Unsplash).jpg
            - text: · Ambir Tolang (gorkhe1980) · CC0
          - listitem [ref=f24e26]:
            - text: 속초 설악산 ·
            - link "Seoraksan 설악산 01.jpg" [ref=f24e27] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASeoraksan_%EC%84%A4%EC%95%85%EC%82%B0_01.jpg
            - text: · Elananna · CC BY-SA 3.0
          - listitem [ref=f24e28]:
            - text: 부산 감천문화마을 ·
            - link "Gamcheon Culture Village Busan (44835394645).jpg" [ref=f24e29] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGamcheon_Culture_Village_Busan_(44835394645).jpg
            - text: · bryan... · CC BY-SA 2.0
          - listitem [ref=f24e30]:
            - text: 남해대교 ·
            - link "Namhae Bridge1.jpg" [ref=f24e31] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ANamhae_Bridge1.jpg
            - text: · Glabb · Public domain
          - listitem [ref=f24e32]:
            - text: 서울 경복궁 경회루 ·
            - link "Gyeonghoeru (Royal Banquet Hall) at Gyeongbokgung Palace, Seoul.jpg" [ref=f24e33] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGyeonghoeru_(Royal_Banquet_Hall)_at_Gyeongbokgung_Palace%2C_Seoul.jpg
            - text: · Frank Schulenburg · CC BY-SA 4.0
          - listitem [ref=f24e34]:
            - text: 안동 하회마을 ·
            - link "Hahoe Folk Village 02.jpg" [ref=f24e35] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHahoe_Folk_Village_02.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e36]:
            - text: 담양 죽녹원 ·
            - link "Korea-Damyang-Juknogwon-Bamboo Garden-01.jpg" [ref=f24e37] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKorea-Damyang-Juknogwon-Bamboo_Garden-01.jpg
            - text: · Byungjoon Kim · CC BY 2.0
          - listitem [ref=f24e38]:
            - text: 순천만 ·
            - link "20150808최광모RX10DSC01732.JPG" [ref=f24e39] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20150808%EC%B5%9C%EA%B4%91%EB%AA%A8RX10DSC01732.JPG
            - text: · 최광모 · CC0
          - listitem [ref=f24e40]:
            - text: 단양 ·
            - link "Danyanggun Travel Day2 02 (32359798405).jpg" [ref=f24e41] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADanyanggun_Travel_Day2_02_(32359798405).jpg
            - text: · Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0
          - listitem [ref=f24e42]:
            - text: 도쿄 Shibuya crossing ·
            - link "Tokyo Shibuya Scramble Crossing 2018-10-09.jpg" [ref=f24e43] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg
            - text: · Benh LIEU SONG (Flickr) · CC BY-SA 2.0
          - listitem [ref=f24e44]:
            - text: 오사카 Dotonbori ·
            - link "Dotonbori ao 02.jpg" [ref=f24e45] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADotonbori_ao_02.jpg
            - text: · Sakai Yayoi · CC0
          - listitem [ref=f24e46]:
            - text: 교토 Fushimi Inari torii ·
            - link "KyotoFushimiInariLarge.jpg" [ref=f24e47] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKyotoFushimiInariLarge.jpg
            - text: · Paul Vlaar · CC BY-SA 3.0
          - listitem [ref=f24e48]:
            - text: 후쿠오카 Fukuoka skyline ·
            - link "Hakata skyline clouds buildings - 2024 September 23 24 various 09 29 47 115000.jpeg" [ref=f24e49] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHakata_skyline_clouds_buildings_-_2024_September_23_24_various_09_29_47_115000.jpeg
            - text: · Nesnad · CC BY 4.0
          - listitem [ref=f24e50]:
            - text: 삿포로 Sapporo Odori Park ·
            - link "20240923 Sapporo Odori Park.jpg" [ref=f24e51] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20240923_Sapporo_Odori_Park.jpg
            - text: · ノボホショコロトソ · CC BY 4.0
          - listitem [ref=f24e52]:
            - text: 오키나와 Kouri bridge Okinawa ·
            - link "Kouri Bridge 202006.jpg" [ref=f24e53] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKouri_Bridge_202006.jpg
            - text: · Kugel~commonswiki · CC BY-SA 4.0
          - listitem [ref=f24e54]:
            - text: 나고야 Nagoya Castle ·
            - link "NagoyaCastleTower.jpg" [ref=f24e55] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ANagoyaCastleTower.jpg
            - text: · Markus Leupold-Löwenthal · CC BY-SA 3.0
          - listitem [ref=f24e56]:
            - text: 고베 Kobe harbor night ·
            - link "Harbor Road at night.jpg" [ref=f24e57] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHarbor_Road_at_night.jpg
            - text: · そらみみ · CC BY-SA 4.0
          - listitem [ref=f24e58]:
            - text: 나라 Todai-ji ·
            - link "The Great Buddha Hall of Tōdai-ji, Nara, November 2016.jpg" [ref=f24e59] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AThe_Great_Buddha_Hall_of_T%C5%8Ddai-ji%2C_Nara%2C_November_2016.jpg
            - text: · Martin Falbisoner · CC BY-SA 4.0
          - listitem [ref=f24e60]:
            - text: 히로시마 Itsukushima torii ·
            - link "Itsukushima Floating Torii Gate, Southeast view 20190417 2.jpg" [ref=f24e61] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AItsukushima_Floating_Torii_Gate%2C_Southeast_view_20190417_2.jpg
            - text: · DXR · CC BY-SA 4.0
          - listitem [ref=f24e62]:
            - text: 벳푸 Beppu hells onsen ·
            - link "The Beppu's Sea Hell (52133778575).jpg" [ref=f24e63] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AThe_Beppu's_Sea_Hell_(52133778575).jpg
            - text: · Raita Futo · CC BY 2.0
          - listitem [ref=f24e64]:
            - text: 가나자와 Kenroku-en ·
            - link "131109 Kenrokuen Kanazawa Ishikawa pref Japan05s3.jpg" [ref=f24e65] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A131109_Kenrokuen_Kanazawa_Ishikawa_pref_Japan05s3.jpg
            - text: · 663highland · CC BY 2.5
          - listitem [ref=f24e66]:
            - text: 하코네 Lake Ashi Mount Fuji ·
            - link "Mount Fuji from Lake Ashi 20211202-1.jpg" [ref=f24e67] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMount_Fuji_from_Lake_Ashi_20211202-1.jpg
            - text: · Suicasmo · CC BY-SA 4.0
          - listitem [ref=f24e68]:
            - text: 하코다테 Hakodate night view ·
            - link "Hakodate Hachimanzaka at night 20231223a.jpg" [ref=f24e69] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHakodate_Hachimanzaka_at_night_20231223a.jpg
            - text: · 掬茶 · CC BY-SA 4.0
          - listitem [ref=f24e70]:
            - text: 이시가키 Kabira Bay ·
            - link "Kabira Bay Ishigaki Island40bs3s4592.jpg" [ref=f24e71] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKabira_Bay_Ishigaki_Island40bs3s4592.jpg
            - text: · 663highland · CC BY 2.5
          - listitem [ref=f24e72]:
            - text: 타이베이 Taipei skyline ·
            - link "Taipei - Skyline Sunset.jpg" [ref=f24e73] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATaipei_-_Skyline_Sunset.jpg
            - text: · Jorge Cancela · CC BY 2.0
          - listitem [ref=f24e74]:
            - text: 가오슝 Lotus Pond Kaohsiung ·
            - link "Kaohsiung Lotus Pond - Qingshui Temple - 洲仔清水宮 (2026) - img 20.jpg" [ref=f24e75] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKaohsiung_Lotus_Pond_-_Qingshui_Temple_-_%E6%B4%B2%E4%BB%94%E6%B8%85%E6%B0%B4%E5%AE%AE_(2026)_-_img_20.jpg
            - text: · Chainwit. · CC BY 4.0
          - listitem [ref=f24e76]:
            - text: 화롄 Qingshui Cliff ·
            - link "Taiwan 2009 CingShui Cliffs on SuHua Highway FRD 6762 Pano Extracted.jpg" [ref=f24e77] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATaiwan_2009_CingShui_Cliffs_on_SuHua_Highway_FRD_6762_Pano_Extracted.jpg
            - text: · Fred Hsu · CC BY-SA 3.0
          - listitem [ref=f24e78]:
            - text: 홍콩 Victoria Harbour night ·
            - link "Hong Kong Harbour Night 2019-06-11.jpg" [ref=f24e79] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHong_Kong_Harbour_Night_2019-06-11.jpg
            - text: · Benh LIEU SONG (Flickr) · CC BY-SA 4.0
          - listitem [ref=f24e80]:
            - text: 마카오 Senado Square ·
            - link "Santa Casa de Misericordia, Macao, 2013-08-08, DD 02.jpg" [ref=f24e81] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASanta_Casa_de_Misericordia%2C_Macao%2C_2013-08-08%2C_DD_02.jpg
            - text: · Diego Delso · CC BY-SA 3.0
          - listitem [ref=f24e82]:
            - text: 상하이 Lujiazui skyline ·
            - link "Lujiazui from The Bund.jpg" [ref=f24e83] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALujiazui_from_The_Bund.jpg
            - text: · kallerna · CC BY-SA 4.0
          - listitem [ref=f24e84]:
            - text: 베이징 Forbidden City ·
            - link "Beijing forbidden city Belvedere of Embodying Benevolence-20071018-RM-142403.jpg" [ref=f24e85] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABeijing_forbidden_city_Belvedere_of_Embodying_Benevolence-20071018-RM-142403.jpg
            - text: · Ermell · CC BY-SA 4.0
          - listitem [ref=f24e86]:
            - text: 칭다오 Qingdao Zhanqiao pier ·
            - link "Qingdao - panoramio (3).jpg" [ref=f24e87] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AQingdao_-_panoramio_(3).jpg
            - text: · ---=XEON=--- · CC BY 3.0
          - listitem [ref=f24e88]:
            - text: 장자제 Zhangjiajie National Forest Park ·
            - link "Zhangjiajie National Forest Park 张家界国家森林公园, Hunan, 2023 (52669865292).jpg" [ref=f24e89] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AZhangjiajie_National_Forest_Park_%E5%BC%A0%E5%AE%B6%E7%95%8C%E5%9B%BD%E5%AE%B6%E6%A3%AE%E6%9E%97%E5%85%AC%E5%9B%AD%2C_Hunan%2C_2023_(52669865292).jpg
            - text: · JL Cogburn · CC BY-SA 2.0
          - listitem [ref=f24e90]:
            - text: 시안 Xi'an city wall ·
            - link "Xi'an city walls.jpg" [ref=f24e91] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AXi'an_city_walls.jpg
            - text: · Ideophagous · CC BY-SA 4.0
          - listitem [ref=f24e92]:
            - text: 청두 Chengdu giant panda ·
            - link "Panda in Chengdu Research Base of Giant Panda Breeding - 7708872342.jpg" [ref=f24e93] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APanda_in_Chengdu_Research_Base_of_Giant_Panda_Breeding_-_7708872342.jpg
            - text: · George Lu · CC BY 2.0
          - listitem [ref=f24e94]:
            - text: 방콕 Wat Arun ·
            - link "Phra Prang Wat Arun during day.jpg" [ref=f24e95] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APhra_Prang_Wat_Arun_during_day.jpg
            - text: · This Photo was taken by Supanut Arunoprayote. Feel free to use any of my images, but please mention me as the author and · CC BY 4.0
          - listitem [ref=f24e96]:
            - text: 치앙마이 Chiang Mai temple ·
            - link "Chiang Mai Temple Thailand 1.jpg" [ref=f24e97] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AChiang_Mai_Temple_Thailand_1.jpg
            - text: · Philip Nalangan · CC BY 4.0
          - listitem [ref=f24e98]:
            - text: 푸껫 Phi Phi islands ·
            - link "Playa Maya, Ko Phi Phi, Tailandia, 2013-08-19, DD 13.JPG" [ref=f24e99] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APlaya_Maya%2C_Ko_Phi_Phi%2C_Tailandia%2C_2013-08-19%2C_DD_13.JPG
            - text: · Diego Delso · CC BY-SA 3.0
          - listitem [ref=f24e100]:
            - text: 끄라비 Krabi islands ·
            - link "Krabi Province, April, 2018-2.jpg" [ref=f24e101] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKrabi_Province%2C_April%2C_2018-2.jpg
            - text: · Alexey Komarov · CC BY-SA 4.0
          - listitem [ref=f24e102]:
            - text: 다낭 Golden Bridge Ba Na Hills ·
            - link "The Golden Bridge, Ba Na Hills, Vietnam.jpg" [ref=f24e103] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AThe_Golden_Bridge%2C_Ba_Na_Hills%2C_Vietnam.jpg
            - text: · . Ray in Manila · CC BY 2.0
          - listitem [ref=f24e104]:
            - text: 호이안 Hoi An lanterns ·
            - link "Lanterns in Hoi An, Vietnam (25708206924).jpg" [ref=f24e105] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALanterns_in_Hoi_An%2C_Vietnam_(25708206924).jpg
            - text: · katiebordner · CC BY 2.0
          - listitem [ref=f24e106]:
            - text: 하노이 Hoan Kiem Lake ·
            - link "Hoan Kiem Lake 03.jpg" [ref=f24e107] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHoan_Kiem_Lake_03.jpg
            - text: · Christophe95 · CC BY-SA 4.0
          - listitem [ref=f24e108]:
            - text: 나트랑 Nha Trang bay ·
            - link "Hòn Nội, Nha Trang Bay, Vietnam.jpg" [ref=f24e109] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AH%C3%B2n_N%E1%BB%99i%2C_Nha_Trang_Bay%2C_Vietnam.jpg
            - text: · Minh Duc Ly · Public domain
          - listitem [ref=f24e110]:
            - text: 달랏 Xuan Huong Lake ·
            - link "Xuan Huong Lake (46420763535).jpg" [ref=f24e111] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AXuan_Huong_Lake_(46420763535).jpg
            - text: · Lê Minh Phát from 6, Việt Nam · CC BY 2.0
          - listitem [ref=f24e112]:
            - text: 푸꾸옥 Phu Quoc beach ·
            - link "Kem Beach aerial view Phu Quoc Island Vietnam.jpg" [ref=f24e113] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKem_Beach_aerial_view_Phu_Quoc_Island_Vietnam.jpg
            - text: · Vivu Vietnam · CC BY-SA 4.0
          - listitem [ref=f24e114]:
            - text: 싱가포르 Marina Bay Sands ·
            - link "Puente Helix, Marina Bay, Singapur, 2023-08-16, DD 144-146 HDR.jpg" [ref=f24e115] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APuente_Helix%2C_Marina_Bay%2C_Singapur%2C_2023-08-16%2C_DD_144-146_HDR.jpg
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e116]:
            - text: 쿠알라룸푸르 Petronas Towers ·
            - link "The Twins SE Asia 2019 (49171985716).jpg" [ref=f24e117] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AThe_Twins_SE_Asia_2019_(49171985716).jpg
            - text: · James Kerwin from Tbilisi · CC BY 2.0
          - listitem [ref=f24e118]:
            - text: 코타키나발루 Kota Kinabalu sunset ·
            - link "View of the sunset from Le Méridien Hotel, Kota Kinabalu (4).jpg" [ref=f24e119] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AView_of_the_sunset_from_Le_M%C3%A9ridien_Hotel%2C_Kota_Kinabalu_(4).jpg
            - text: · Ahmad Ali Karim · CC0
          - listitem [ref=f24e120]:
            - text: 페낭 Kek Lok Si ·
            - link "Kek Lok Si Temple (I).jpg" [ref=f24e121] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKek_Lok_Si_Temple_(I).jpg
            - text: · This Photo was taken by Supanut Arunoprayote. Feel free to use any of my images, but please mention me as the author and · CC BY 4.0
          - listitem [ref=f24e122]:
            - text: 발리 Tegallalang rice terrace ·
            - link "Tegallalang Rice Terraces Bali 1.jpg" [ref=f24e123] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATegallalang_Rice_Terraces_Bali_1.jpg
            - text: · Philip Nalangan · CC BY 4.0
          - listitem [ref=f24e124]:
            - text: 세부 Cebu Kawasan Falls ·
            - link "Badian Kawasan Falls Cebu.jpg" [ref=f24e125] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABadian_Kawasan_Falls_Cebu.jpg
            - text: · Shemlongakit · CC BY-SA 4.0
          - listitem [ref=f24e126]:
            - text: 보라카이 Boracay sunset ·
            - link "KIRKAMON BORACAY SUNSET.jpg" [ref=f24e127] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKIRKAMON_BORACAY_SUNSET.jpg
            - text: · Kirkamon · CC BY-SA 4.0
          - listitem [ref=f24e128]:
            - text: 씨엠립 Angkor Wat sunrise ·
            - link "Angkor Wat Dawn2.jpg" [ref=f24e129] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAngkor_Wat_Dawn2.jpg
            - text: · Radek Kucharski · CC BY 2.0
          - listitem [ref=f24e130]:
            - text: 루앙프라방 Kuang Si Falls ·
            - link "Rocks of Kuang Si Falls near Luang Prabang Laos.jpg" [ref=f24e131] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ARocks_of_Kuang_Si_Falls_near_Luang_Prabang_Laos.jpg
            - text: · Basile Morin · CC BY-SA 4.0
          - listitem [ref=f24e132]:
            - text: 델리 Humayun's Tomb ·
            - link "20191205 Grobowiec Humajuna w Delhi 1055 6794.jpg" [ref=f24e133] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20191205_Grobowiec_Humajuna_w_Delhi_1055_6794.jpg
            - text: · Jakub Hałun · CC BY-SA 4.0
          - listitem [ref=f24e134]:
            - text: 자이푸르 Hawa Mahal ·
            - link "20191218 Pałac Wiatrów w Jaipurze 1129 9124.jpg" [ref=f24e135] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20191218_Pa%C5%82ac_Wiatr%C3%B3w_w_Jaipurze_1129_9124.jpg
            - text: · Jakub Hałun · CC BY-SA 4.0
          - listitem [ref=f24e136]:
            - text: 포카라 Phewa Lake Pokhara ·
            - link "Calmness of Phewa lake.jpg" [ref=f24e137] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACalmness_of_Phewa_lake.jpg
            - text: · Q-lieb-in · CC BY-SA 4.0
          - listitem [ref=f24e138]:
            - text: 사마르칸트 Registan ·
            - link "Самарканд. Площадь-Регистан.jpg" [ref=f24e139] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%D0%A1%D0%B0%D0%BC%D0%B0%D1%80%D0%BA%D0%B0%D0%BD%D0%B4._%D0%9F%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D1%8C-%D0%A0%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D0%B0%D0%BD.jpg
            - text: · Kraftabbas · CC BY-SA 4.0
          - listitem [ref=f24e140]:
            - text: 울란바토르 Terelj National Park ·
            - link "Krajobraz w Parku Narodowym Gorchi-Tereldż 07.JPG" [ref=f24e141] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKrajobraz_w_Parku_Narodowym_Gorchi-Tereld%C5%BC_07.JPG
            - text: · Marcin Konsek · CC BY-SA 4.0
          - listitem [ref=f24e142]:
            - text: 두바이 Burj Khalifa ·
            - link "Dubai Skyline mit Burj Khalifa (18241030269).jpg" [ref=f24e143] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADubai_Skyline_mit_Burj_Khalifa_(18241030269).jpg
            - text: · Tim Reckmann from Hamm, Deutschland · CC BY 2.0
          - listitem [ref=f24e144]:
            - text: 이스탄불 Blue Mosque ·
            - link "Mezquita Azul, Estambul, Turquía, 2024-09-30, DD 58.jpg" [ref=f24e145] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMezquita_Azul%2C_Estambul%2C_Turqu%C3%ADa%2C_2024-09-30%2C_DD_58.jpg
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e146]:
            - text: 카파도키아 Cappadocia balloons ·
            - link "Hot air balloon start in Cappadocia 2014.jpg" [ref=f24e147] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHot_air_balloon_start_in_Cappadocia_2014.jpg
            - text: · This Photo was taken by Wolfgang Moroder. Feel free to use my photos, but please mention me as the author and send me a · CC BY-SA 3.0
          - listitem [ref=f24e148]:
            - text: 페트라 Petra Treasury ·
            - link "Petra Al Khazneh 1975.jpg" [ref=f24e149] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APetra_Al_Khazneh_1975.jpg
            - text: · Dosseman · CC BY-SA 4.0
          - listitem [ref=f24e150]:
            - text: 트빌리시 Kazbegi Gergeti Trinity Church ·
            - link "Kazbegi, Gergeti Trinity Church and Mt Kazbek (35959311351).jpg" [ref=f24e151] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKazbegi%2C_Gergeti_Trinity_Church_and_Mt_Kazbek_(35959311351).jpg
            - text: · Arian Zwegers from Brussels, Belgium · CC BY 2.0
          - listitem [ref=f24e152]:
            - text: 말레 Maldives island aerial ·
            - link "Bathala (Maldives) 2.jpg" [ref=f24e153] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABathala_(Maldives)_2.jpg
            - text: · Gzzz · CC BY-SA 4.0
          - listitem [ref=f24e154]:
            - text: 괌 Guam beach ·
            - link "Asan Invasion Beach, Guam - Flickr - kla4067.jpg" [ref=f24e155] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAsan_Invasion_Beach%2C_Guam_-_Flickr_-_kla4067.jpg
            - text: · Ron Reiring from Inland Empire of Southern California, USA · CC BY 2.0
          - listitem [ref=f24e156]:
            - text: 사이판 Managaha island ·
            - link "Mañagaha Island.jpg" [ref=f24e157] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMa%C3%B1agaha_Island.jpg
            - text: · Gage Skidmore · CC BY-SA 4.0
          - listitem [ref=f24e158]:
            - text: 팔라우 Palau aerial ·
            - link "Palau 2008030818 5624 (2347766066).jpg" [ref=f24e159] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APalau_2008030818_5624_(2347766066).jpg
            - text: · LuxTonnerre from Munich, Germany · CC BY 2.0
          - listitem [ref=f24e160]:
            - text: 시드니 Sydney Opera House ·
            - link "Sydneyoperahouse at night.jpg" [ref=f24e161] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASydneyoperahouse_at_night.jpg
            - text: · Thomas Adams · CC BY-SA 4.0
          - listitem [ref=f24e162]:
            - text: 멜버른 Melbourne skyline Yarra ·
            - link "Melbourne (AU), Melbourne City Centre -- 2019 -- 1530-4.jpg" [ref=f24e163] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMelbourne_(AU)%2C_Melbourne_City_Centre_--_2019_--_1530-4.jpg
            - text: · Dietmar Rabich · CC BY-SA 4.0
          - listitem [ref=f24e164]:
            - text: 케언스 Great Barrier Reef aerial ·
            - link "Aerial View of Great Barrier Reef (Ank Kumar) 02.jpg" [ref=f24e165] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAerial_View_of_Great_Barrier_Reef_(Ank_Kumar)_02.jpg
            - text: · Ank Kumar · CC BY-SA 4.0
          - listitem [ref=f24e166]:
            - text: 퀸스타운 Queenstown Lake Wakatipu ·
            - link "Queenstown - Lake Wakatipu 22 (31532105142).jpg" [ref=f24e167] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AQueenstown_-_Lake_Wakatipu_22_(31532105142).jpg
            - text: · Tony Hisgett from Birmingham, UK · CC BY 2.0
          - listitem [ref=f24e168]:
            - text: 오클랜드 Auckland skyline ·
            - link "Auckland Skyline as seen from Devonport 20100128 3.jpg" [ref=f24e169] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAuckland_Skyline_as_seen_from_Devonport_20100128_3.jpg
            - text: · DXR · CC BY-SA 4.0
          - listitem [ref=f24e170]:
            - text: 난디 Mamanuca Islands ·
            - link "Kadavulailai.jpg" [ref=f24e171] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKadavulailai.jpg
            - text: · Jaejay77 · CC BY-SA 4.0
          - listitem [ref=f24e172]:
            - text: 로마 Colosseum ·
            - link "Colosseum in Rome-April 2007-1- copie 2B.jpg" [ref=f24e173] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AColosseum_in_Rome-April_2007-1-_copie_2B.jpg
            - text: · Diliff · CC BY-SA 2.5
          - listitem [ref=f24e174]:
            - text: 피렌체 Florence Duomo ·
            - link "Florence Duomo from Michelangelo hill.jpg" [ref=f24e175] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AFlorence_Duomo_from_Michelangelo_hill.jpg
            - text: · Petar Milošević · CC BY-SA 4.0
          - listitem [ref=f24e176]:
            - text: 베네치아 Rialto Bridge ·
            - link "Fondaco dei Tedeschi Rialto Palazzo dei Camerlenghi Fabbriche Nuove a Venezia.jpg" [ref=f24e177] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AFondaco_dei_Tedeschi_Rialto_Palazzo_dei_Camerlenghi_Fabbriche_Nuove_a_Venezia.jpg
            - text: · This Photo was taken by Wolfgang Moroder. Feel free to use my photos, but please mention me as the author and send me a · CC BY-SA 3.0
          - listitem [ref=f24e178]:
            - text: 아말피 Positano ·
            - link "Amalfi vista dal mare Campania.jpg" [ref=f24e179] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAmalfi_vista_dal_mare_Campania.jpg
            - text: · This Photo was taken by Wolfgang Moroder. Feel free to use my photos, but please mention me as the author and send me a · CC BY-SA 3.0
          - listitem [ref=f24e180]:
            - text: 돌로미티 Lago di Braies ·
            - link "Lago di Braies South Tyrol 7.jpg" [ref=f24e181] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALago_di_Braies_South_Tyrol_7.jpg
            - text: · kallerna · CC BY-SA 4.0
          - listitem [ref=f24e182]:
            - text: 바르셀로나 Barcelona skyline ·
            - link "Barcelona skyline.jpg" [ref=f24e183] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABarcelona_skyline.jpg
            - text: · frank müller · CC BY-SA 2.0
          - listitem [ref=f24e184]:
            - text: 세비야 Real Alcazar Seville ·
            - link "JardinLasDamas Alcazar Seville.jpg" [ref=f24e185] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJardinLasDamas_Alcazar_Seville.jpg
            - text: · Martinvl · CC BY-SA 4.0
          - listitem [ref=f24e186]:
            - text: 그라나다 Alhambra ·
            - link "Granada - View from Mirador de San Nicolás - 02.jpg" [ref=f24e187] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGranada_-_View_from_Mirador_de_San_Nicol%C3%A1s_-_02.jpg
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e188]:
            - text: 산세바스티안 Monte Igueldo ·
            - link "Monte Igueldo, San Sebastian.jpg" [ref=f24e189] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMonte_Igueldo%2C_San_Sebastian.jpg
            - text: · Marco Almbauer · CC0
          - listitem [ref=f24e190]:
            - text: 마요르카 Palma Cathedral ·
            - link "Kathedrale von Palma.jpg" [ref=f24e191] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKathedrale_von_Palma.jpg
            - text: · Thomas Wolf, www.foto-tw.de · CC BY-SA 3.0 de
          - listitem [ref=f24e192]:
            - text: 파리 Louvre pyramid ·
            - link "Louvre museum 01.jpg" [ref=f24e193] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALouvre_museum_01.jpg
            - text: · Maksim Sokolov (maxergon.com) · CC BY-SA 4.0
          - listitem [ref=f24e194]:
            - text: 니스 Nice Promenade des Anglais ·
            - link "Promenade des Anglais (Nice), France.jpg" [ref=f24e195] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APromenade_des_Anglais_(Nice)%2C_France.jpg
            - text: · Uhooep · CC BY-SA 4.0
          - listitem [ref=f24e196]:
            - text: 콜마르 Colmar Petite Venise ·
            - link "20241002 Petite Venise Colmar 02.jpg" [ref=f24e197] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20241002_Petite_Venise_Colmar_02.jpg
            - text: · Flocci Nivis · CC BY 4.0
          - listitem [ref=f24e198]:
            - text: 인터라켄 Interlaken ·
            - link "Interlaken Ost.jpg" [ref=f24e199] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AInterlaken_Ost.jpg
            - text: · [Tycho] talk , http://shansov.net · CC BY 3.0
          - listitem [ref=f24e200]:
            - text: 체르마트 Matterhorn Riffelsee ·
            - link "Riffelsee with Matterhorn behind.jpg" [ref=f24e201] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ARiffelsee_with_Matterhorn_behind.jpg
            - text: · OlhaSolodenko · CC BY-SA 4.0
          - listitem [ref=f24e202]:
            - text: 루체른 Chapel Bridge Lucerne ·
            - link "CH.LU.Luzern Kapellbrücke 01 16x9-R 16384x9216.jpg" [ref=f24e203] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACH.LU.Luzern_Kapellbr%C3%BCcke_01_16x9-R_16384x9216.jpg
            - text: "· NOTE: This image is a panorama consisting of multiple frames that were merged or stitched in software. As a result, this · CC BY-SA 4.0"
          - listitem [ref=f24e204]:
            - text: 런던 Tower Bridge ·
            - link "Tower Bridge London Feb 2006.jpg" [ref=f24e205] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATower_Bridge_London_Feb_2006.jpg
            - text: · Diliff · CC BY-SA 3.0
          - listitem [ref=f24e206]:
            - text: 에든버러 Edinburgh skyline Calton Hill ·
            - link "Skyline of Edinburgh.jpg" [ref=f24e207] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASkyline_of_Edinburgh.jpg
            - text: · Andrew Colin · CC BY 2.0
          - listitem [ref=f24e208]:
            - text: 코츠월드 Bibury Arlington Row ·
            - link "Bibury 2015 04.jpg" [ref=f24e209] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABibury_2015_04.jpg
            - text: · Photograph by Mike Peel (www.mikepeel.net). · CC BY-SA 4.0
          - listitem [ref=f24e210]:
            - text: 두브로브니크 Dubrovnik aerial ·
            - link "Old city of Dubrovnik (29625709474).jpg" [ref=f24e211] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AOld_city_of_Dubrovnik_(29625709474).jpg
            - text: · Miguel Mendez · CC BY 2.0
          - listitem [ref=f24e212]:
            - text: 플리트비체 Plitvice Lakes ·
            - link "Lika-Senj (HR), Plitvicer Seen, Kleiner Prštavac -- 2022 -- 0152.jpg" [ref=f24e213] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALika-Senj_(HR)%2C_Plitvicer_Seen%2C_Kleiner_Pr%C5%A1tavac_--_2022_--_0152.jpg
            - text: · Anil Öztas · CC BY-SA 4.0
          - listitem [ref=f24e214]:
            - text: 산토리니 Oia Santorini ·
            - link "1000 Three domes of Oia in Santorini Photo by Giles Laurent.jpg" [ref=f24e215] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A1000_Three_domes_of_Oia_in_Santorini_Photo_by_Giles_Laurent.jpg
            - text: · Giles Laurent · CC BY-SA 4.0
          - listitem [ref=f24e216]:
            - text: 아테네 Acropolis Athens ·
            - link "Erechtheum Acropolis Athens.jpg" [ref=f24e217] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AErechtheum_Acropolis_Athens.jpg
            - text: · Jebulon · CC0
          - listitem [ref=f24e218]:
            - text: 리스본 Lisbon Alfama tram ·
            - link "Lissabon - Alfama - Largo de Santa Luzia - Streetcar - 2.jpg" [ref=f24e219] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALissabon_-_Alfama_-_Largo_de_Santa_Luzia_-_Streetcar_-_2.jpg
            - text: · Ingo Mehling · CC BY-SA 4.0
          - listitem [ref=f24e220]:
            - text: 포르투 Dom Luis bridge Porto ·
            - link "Ponte de D. Luís 2.jpg" [ref=f24e221] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APonte_de_D._Lu%C3%ADs_2.jpg
            - text: · T meltzer · CC BY-SA 4.0
          - listitem [ref=f24e222]:
            - text: 빈 Schonbrunn Palace ·
            - link "Palacio de Schönbrunn, Viena, Austria, 2020-02-02, DD 37.jpg" [ref=f24e223] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APalacio_de_Sch%C3%B6nbrunn%2C_Viena%2C_Austria%2C_2020-02-02%2C_DD_37.jpg
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e224]:
            - text: 할슈타트 Hallstatt lake ·
            - link "Cygnus olor Hallstatt 20180206 01.jpg" [ref=f24e225] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACygnus_olor_Hallstatt_20180206_01.jpg
            - text: · Uoaei1 · CC BY-SA 4.0
          - listitem [ref=f24e226]:
            - text: 프라하 Charles Bridge Prague ·
            - link "Puente Carlos, Praga, República Checa, 2022-07-02, DD 215.jpg" [ref=f24e227] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APuente_Carlos%2C_Praga%2C_Rep%C3%BAblica_Checa%2C_2022-07-02%2C_DD_215.jpg
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e228]:
            - text: 부다페스트 Hungarian Parliament Danube ·
            - link "HUN-2015-Budapest-Hungarian Parliament (Budapest) 2015-02.jpg" [ref=f24e229] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHUN-2015-Budapest-Hungarian_Parliament_(Budapest)_2015-02.jpg
            - text: · Godot13 · CC BY-SA 4.0
          - listitem [ref=f24e230]:
            - text: 암스테르담 Amsterdam canal ·
            - link "Amsterdam, Singel 110-124 RM5294tm8 IMG 3433 2024-06-24 13.28.jpg" [ref=f24e231] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAmsterdam%2C_Singel_110-124_RM5294tm8_IMG_3433_2024-06-24_13.28.jpg
            - text: · Michielverbeek · CC BY 4.0
          - listitem [ref=f24e232]:
            - text: 브뤼헤 Bruges canal ·
            - link "Brugge, onbekend deel van een gracht foto7 2015-09-27 13.05.jpg" [ref=f24e233] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABrugge%2C_onbekend_deel_van_een_gracht_foto7_2015-09-27_13.05.jpg
            - text: · Michielverbeek · CC BY-SA 4.0
          - listitem [ref=f24e234]:
            - text: 베르겐 Bryggen Bergen ·
            - link "Bryggen, Bergen, Noruega, 2019-09-08, DD 115-117 PAN.jpg" [ref=f24e235] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABryggen%2C_Bergen%2C_Noruega%2C_2019-09-08%2C_DD_115-117_PAN.jpg
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e236]:
            - text: 트롬쇠 Tromso aurora ·
            - link "Tromso safari aurora.JPG" [ref=f24e237] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATromso_safari_aurora.JPG
            - text: · Smitra0 · CC BY-SA 3.0
          - listitem [ref=f24e238]:
            - text: 레이캬비크 Reykjavik Hallgrimskirkja ·
            - link "+Die Hallgrimskirkja ist das markanteste Bauwerk Reykjaviks. 02.jpg" [ref=f24e239] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%2BDie_Hallgrimskirkja_ist_das_markanteste_Bauwerk_Reykjaviks._02.jpg
            - text: · Holger Uwe Schmitt · CC BY-SA 4.0
          - listitem [ref=f24e240]:
            - text: 로바니에미 Lapland aurora ·
            - link "Aurora borealis over Lapland (Unsplash).jpg" [ref=f24e241] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAurora_borealis_over_Lapland_(Unsplash).jpg
            - text: · Vincent Guth vingtcent · CC0
          - listitem [ref=f24e242]:
            - text: 코펜하겐 Nyhavn ·
            - link "2018 - Nyhavn on sunset.jpg" [ref=f24e243] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A2018_-_Nyhavn_on_sunset.jpg
            - text: · Moahim · CC BY-SA 4.0
          - listitem [ref=f24e244]:
            - text: 크라쿠프 Krakow Main Square ·
            - link "Krakow - Cloth Hall from Basilica - 1.jpg" [ref=f24e245] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKrakow_-_Cloth_Hall_from_Basilica_-_1.jpg
            - text: · Ingo Mehling · CC BY-SA 4.0
          - listitem [ref=f24e246]:
            - text: 블레드 Bled island church ·
            - link "Bled Island and Bled Castle, Slovenia, 20240504 0906 8331.jpg" [ref=f24e247] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABled_Island_and_Bled_Castle%2C_Slovenia%2C_20240504_0906_8331.jpg
            - text: · Jakub Hałun · CC BY 4.0
          - listitem [ref=f24e248]:
            - text: 코토르 Kotor bay ·
            - link "Risan, Bahía de Kotor, Montenegro, 2014-04-19, DD 08.JPG" [ref=f24e249] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ARisan%2C_Bah%C3%ADa_de_Kotor%2C_Montenegro%2C_2014-04-19%2C_DD_08.JPG
            - text: · Diego Delso · CC BY-SA 3.0
          - listitem [ref=f24e250]:
            - text: 발레타 Valletta harbour ·
            - link "Valletta Grand Harbour from Upper Barrakka Gardens.jpg" [ref=f24e251] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AValletta_Grand_Harbour_from_Upper_Barrakka_Gardens.jpg
            - text: · Trajcinema · CC BY 4.0
          - listitem [ref=f24e252]:
            - text: 뉴욕 Manhattan skyline ·
            - link "Lower Manhattan skyline from New York Harbor, New York.jpg" [ref=f24e253] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALower_Manhattan_skyline_from_New_York_Harbor%2C_New_York.jpg
            - text: · Christian David · CC BY-SA 4.0
          - listitem [ref=f24e254]:
            - text: 샌프란시스코 Golden Gate Bridge ·
            - link "Old Crissy Field Coast Guard Station in the fog (December 2015).jpg" [ref=f24e255] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AOld_Crissy_Field_Coast_Guard_Station_in_the_fog_(December_2015).jpg
            - text: · Frank Schulenburg · CC BY-SA 4.0
          - listitem [ref=f24e256]:
            - text: 하와이 Waikiki Diamond Head ·
            - link "View towards Diamond Head from Waikiki (5216373638).jpg" [ref=f24e257] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AView_towards_Diamond_Head_from_Waikiki_(5216373638).jpg
            - text: · Daniel Ramirez from Honolulu, USA · CC BY 2.0
          - listitem [ref=f24e258]:
            - text: 라스베이거스 Bellagio fountains ·
            - link "Fountains in front of Bellagio.jpg" [ref=f24e259] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AFountains_in_front_of_Bellagio.jpg
            - text: · David Shane · CC BY 2.0
          - listitem [ref=f24e260]:
            - text: 옐로스톤 Grand Prismatic Spring ·
            - link "Yellowstone National Park (WY, USA), Firehole River, Abflusskanal des Excelsior Geysirs -- 2022 -- 2572-4.jpg" [ref=f24e261] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AYellowstone_National_Park_(WY%2C_USA)%2C_Firehole_River%2C_Abflusskanal_des_Excelsior_Geysirs_--_2022_--_2572-4.jpg
            - text: · Dietmar Rabich · CC BY-SA 4.0
          - listitem [ref=f24e262]:
            - text: 밴쿠버 Vancouver skyline ·
            - link "Vancouver Skyline, Granville Island and Burrard St Bridge 20240831 4.jpg" [ref=f24e263] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AVancouver_Skyline%2C_Granville_Island_and_Burrard_St_Bridge_20240831_4.jpg
            - text: · DXR · CC BY-SA 4.0
          - listitem [ref=f24e264]:
            - text: 밴프 Moraine Lake ·
            - link "1 moraine lake pano 2019.jpg" [ref=f24e265] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A1_moraine_lake_pano_2019.jpg
            - text: · Chensiyuan · CC BY-SA 4.0
          - listitem [ref=f24e266]:
            - text: 옐로나이프 Aurora borealis Yellowknife ·
            - link "Camping Under the Stars and Aurora Borealis - Flickr - stevehfung.jpg" [ref=f24e267] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACamping_Under_the_Stars_and_Aurora_Borealis_-_Flickr_-_stevehfung.jpg
            - text: · Steve FUNG · CC BY-SA 4.0
          - listitem [ref=f24e268]:
            - text: 퀘벡 Chateau Frontenac ·
            - link "Québec city at night, view from Lévis city.jpg" [ref=f24e269] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AQu%C3%A9bec_city_at_night%2C_view_from_L%C3%A9vis_city.jpg
            - text: · Wilfredor · CC BY-SA 4.0
          - listitem [ref=f24e270]:
            - text: 칸쿤 Cancun hotel zone aerial ·
            - link "Skyline cancun mexico. (24209557802).jpg" [ref=f24e271] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASkyline_cancun_mexico._(24209557802).jpg
            - text: · alyssa BLACK. from toronto, canada · CC BY-SA 2.0
          - listitem [ref=f24e272]:
            - text: 쿠스코 Machu Picchu ·
            - link "99 - Machu Picchu - Juin 2009.edit3.jpg" [ref=f24e273] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A99_-_Machu_Picchu_-_Juin_2009.edit3.jpg
            - text: · Martin St-Amant (S23678) · CC BY-SA 3.0
          - listitem [ref=f24e274]:
            - text: 리우데자네이루 Sugarloaf Mountain ·
            - link "Sweet Bread Mountain.jpg" [ref=f24e275] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASweet_Bread_Mountain.jpg
            - text: · Donatas Dabravolskas · CC BY-SA 4.0
          - listitem [ref=f24e276]:
            - text: 엘칼라파테 Perito Moreno Glacier ·
            - link "Trekking at Perito Moreno Glacier.jpg" [ref=f24e277] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATrekking_at_Perito_Moreno_Glacier.jpg
            - text: · Fernando · CC BY-SA 4.0
          - listitem [ref=f24e278]:
            - text: 아타카마 Atacama Valle de la Luna ·
            - link "Anfiteatro, Valle de la Luna, San Pedro de Atacama, Chile, 2016-02-01, DD 150.JPG" [ref=f24e279] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAnfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_150.JPG
            - text: · Diego Delso · CC BY-SA 4.0
          - listitem [ref=f24e280]:
            - text: 마라케시 Majorelle Garden ·
            - link "Le jardin des majorelle 21.JPG" [ref=f24e281] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ALe_jardin_des_majorelle_21.JPG
            - text: · Viault · CC BY-SA 3.0
          - listitem [ref=f24e282]:
            - text: 케이프타운 Boulders Beach penguins ·
            - link "Penguins at Boulders Beach 04.jpg" [ref=f24e283] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APenguins_at_Boulders_Beach_04.jpg
            - text: · Satdeep Gill · CC BY-SA 4.0
          - listitem [ref=f24e284]:
            - text: 잔지바르 Zanzibar beach ·
            - link "Zanzibar beach (33911916866).jpg" [ref=f24e285] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AZanzibar_beach_(33911916866).jpg
            - text: · Mussi Katz from Israel · Public domain
          - listitem [ref=f24e286]:
            - text: 나이로비 Amboseli Kilimanjaro elephants ·
            - link "Amboseli National Park and Mt. Kilimanjaro.jpg" [ref=f24e287] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAmboseli_National_Park_and_Mt._Kilimanjaro.jpg
            - text: · Ninaras · CC BY 4.0
          - listitem [ref=f24e288]:
            - text: 인천 송도 센트럴파크 ·
            - link "Songdo Central Park and Posco Tower Songdo.jpg" [ref=f24e289] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASongdo_Central_Park_and_Posco_Tower_Songdo.jpg
            - text: · Jaehyuk Lee · CC BY-SA 2.0
          - listitem [ref=f24e290]:
            - text: 대전 Daejeon Expo bridge ·
            - link "Daejeon Expo Bridge arches.jpg" [ref=f24e291] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADaejeon_Expo_Bridge_arches.jpg
            - text: · Yoo Chung · CC BY-SA 2.5
          - listitem [ref=f24e292]:
            - text: 울산 Ulsan Daewangam ·
            - link "Daewangam Park on August 17th, 2018.jpg" [ref=f24e293] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADaewangam_Park_on_August_17th%2C_2018.jpg
            - text: · Choi2451 · CC BY-SA 4.0
          - listitem [ref=f24e294]:
            - text: 세종 Sejong Lake Park ·
            - link "Sejong lake park 190609 01.jpg" [ref=f24e295] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASejong_lake_park_190609_01.jpg
            - text: · *Youngjin · CC BY-SA 3.0
          - listitem [ref=f24e296]:
            - text: 파주시 Imjingak Paju ·
            - link "Imjingak pyunghwanuri.jpg" [ref=f24e297] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AImjingak_pyunghwanuri.jpg
            - text: · 한국문화관광연구원 · CC0
          - listitem [ref=f24e298]:
            - text: 연천군 Hantan River Yeoncheon ·
            - link "Jaein Pokpo 180519002.jpg" [ref=f24e299] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJaein_Pokpo_180519002.jpg
            - text: · Jjw · CC BY-SA 4.0
          - listitem [ref=f24e300]:
            - text: 수원시 Hwaseong Fortress Suwon ·
            - link "Hwaseong Fortress 03.jpg" [ref=f24e301] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHwaseong_Fortress_03.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e302]:
            - text: 성남시 Seongnam Bundang Central Park ·
            - link "Akb03.jpg" [ref=f24e303] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAkb03.jpg
            - text: · Akb0516 · CC BY-SA 4.0
          - listitem [ref=f24e304]:
            - text: 구리시 Donggureung ·
            - link "Geonwolleung.JPG" [ref=f24e305] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGeonwolleung.JPG
            - text: · The original uploader was Kbr0706 at Korean Wikipedia. · CC BY-SA 2.5
          - listitem [ref=f24e306]:
            - text: 남양주시 Namyangju Bukhangang ·
            - link "Bukhangang Bicycle Path 1.jpg" [ref=f24e307] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABukhangang_Bicycle_Path_1.jpg
            - text: · Ox1997cow · CC BY-SA 3.0
          - listitem [ref=f24e308]:
            - text: 오산시 Mulhyanggi Arboretum Osan ·
            - link "20251101 Osan 쿠키몬스터 8.jpg" [ref=f24e309] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20251101_Osan_%EC%BF%A0%ED%82%A4%EB%AA%AC%EC%8A%A4%ED%84%B0_8.jpg
            - text: · 쿠키몬스터 · CC BY-SA 4.0
          - listitem [ref=f24e310]:
            - text: 의왕시 백운호수 ·
            - link "20150808최광모RX10DSC00956.JPG" [ref=f24e311] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20150808%EC%B5%9C%EA%B4%91%EB%AA%A8RX10DSC00956.JPG
            - text: · 최광모 · CC0
          - listitem [ref=f24e312]:
            - text: 하남시 Hanam Geomdansan ·
            - link "View from Geomdansan in 2026 (2).jpg" [ref=f24e313] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AView_from_Geomdansan_in_2026_(2).jpg
            - text: · Sadopaul · CC BY-SA 4.0
          - listitem [ref=f24e314]:
            - text: 용인시 Everland ·
            - link "Everland Magic tree.jpg" [ref=f24e315] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AEverland_Magic_tree.jpg
            - text: · Wikiwater2020 · CC BY-SA 3.0
          - listitem [ref=f24e316]:
            - text: 이천시 Icheon ·
            - link "Icheon Hyanggyo 02.jpg" [ref=f24e317] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AIcheon_Hyanggyo_02.jpg
            - text: · *Youngjin · CC BY-SA 3.0
          - listitem [ref=f24e318]:
            - text: 여주시 Yeoju Sejong tomb Yeongneung ·
            - link "Tomb Keeper's house at Yeongneung (Sejong) 01.jpg" [ref=f24e319] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATomb_Keeper's_house_at_Yeongneung_(Sejong)_01.jpg
            - text: · *Youngjin · CC BY-SA 3.0
          - listitem [ref=f24e320]:
            - text: 가평군 Gapyeong Jarasum ·
            - link "Gapyeong Railway Bridge May 19, 2018 sunset 19 36PM Northward Gapyeong-eup (48669552487).jpg" [ref=f24e321] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGapyeong_Railway_Bridge_May_19%2C_2018_sunset_19_36PM_Northward_Gapyeong-eup_(48669552487).jpg
            - text: · Katsujiro Maekawa on flickr This photo was taken with Samsung Galaxy S5 LTE-A · CC0
          - listitem [ref=f24e322]:
            - text: 양평군 Yangpyeong ·
            - link "Namhan River 01.jpg" [ref=f24e323] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ANamhan_River_01.jpg
            - text: · Masterhatch · CC BY-SA 4.0
          - listitem [ref=f24e324]:
            - text: 고양시 Ilsan Lake Park ·
            - link "Pink roses 2.jpg" [ref=f24e325] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APink_roses_2.jpg
            - text: · dae jeung kim · CC0
          - listitem [ref=f24e326]:
            - text: 포천시 Pocheon Art Valley ·
            - link "포천 아트밸리 beeniru 6.JPG" [ref=f24e327] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%ED%8F%AC%EC%B2%9C_%EC%95%84%ED%8A%B8%EB%B0%B8%EB%A6%AC_beeniru_6.JPG
            - text: · Beeniru · CC BY-SA 3.0
          - listitem [ref=f24e328]:
            - text: 화성시 융건릉 ·
            - link "Building At The Prince Grave (175730509).jpeg" [ref=f24e329] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABuilding_At_The_Prince_Grave_(175730509).jpeg
            - text: · Mathew Schwartz · CC BY 3.0
          - listitem [ref=f24e330]:
            - text: 충주시 충주호 ·
            - link "CJ-GMmt-CJLakeV.jpg" [ref=f24e331] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACJ-GMmt-CJLakeV.jpg
            - text: · Dittwjfsdgkvkdjg · CC BY-SA 4.0
          - listitem [ref=f24e332]:
            - text: 제천시 Cheongpung Lake ·
            - link "Chungjuho Lake.jpg" [ref=f24e333] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AChungjuho_Lake.jpg
            - text: · Ashy Minivet · CC0
          - listitem [ref=f24e334]:
            - text: 보은군 Songnisan ·
            - link "Gwaneum Peak at Songnisan.jpg" [ref=f24e335] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGwaneum_Peak_at_Songnisan.jpg
            - text: · Yoo Chung · CC BY-SA 2.5
          - listitem [ref=f24e336]:
            - text: 영동군 월류봉 ·
            - link "월류봉 사진1.jpg" [ref=f24e337] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%9B%94%EB%A5%98%EB%B4%89_%EC%82%AC%EC%A7%841.jpg
            - text: · Shinfull · CC BY-SA 3.0
          - listitem [ref=f24e338]:
            - text: 괴산군 Goesan ·
            - link "Korea Goesan Fall 05 (15017082017).jpg" [ref=f24e339] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKorea_Goesan_Fall_05_(15017082017).jpg
            - text: · Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0
          - listitem [ref=f24e340]:
            - text: 천안시 독립기념관 ·
            - link "Independence Hall 008.jpg" [ref=f24e341] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AIndependence_Hall_008.jpg
            - text: · Foolish Productions Photography · CC BY-SA 4.0
          - listitem [ref=f24e342]:
            - text: 공주시 송산리 고분군 ·
            - link "Sungdeokjeon in Gongju 01.jpg" [ref=f24e343] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASungdeokjeon_in_Gongju_01.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e344]:
            - text: 보령시 Daecheon Beach ·
            - link "20150808최광모RX10DSC01567.JPG" [ref=f24e345] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20150808%EC%B5%9C%EA%B4%91%EB%AA%A8RX10DSC01567.JPG
            - text: · 최광모 · CC0
          - listitem [ref=f24e346]:
            - text: 서산시 Haemieupseong ·
            - link "제1경 해미읍성.jpg" [ref=f24e347] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%A0%9C1%EA%B2%BD_%ED%95%B4%EB%AF%B8%EC%9D%8D%EC%84%B1.jpg
            - text: · Seosan City Government · CC BY-SA 4.0
          - listitem [ref=f24e348]:
            - text: 논산시 Nonsan ·
            - link "Eungdo Dang of Donam Seowon.jpg" [ref=f24e349] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AEungdo_Dang_of_Donam_Seowon.jpg
            - text: · Ryuch · CC BY-SA 3.0
          - listitem [ref=f24e350]:
            - text: 부여군 궁남지 ·
            - link "궁남지.jpg" [ref=f24e351] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EA%B6%81%EB%82%A8%EC%A7%80.jpg
            - text: · 우승민 · CC BY-SA 4.0
          - listitem [ref=f24e352]:
            - text: 서천군 Seocheon ·
            - link "Sinseong-ri Reed Field in fall.jpg" [ref=f24e353] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASinseong-ri_Reed_Field_in_fall.jpg
            - text: · Shinfull · CC BY-SA 4.0
          - listitem [ref=f24e354]:
            - text: 청양군 Cheongyang ·
            - link "JangGok temple in Cheongyang, South Korea.jpg" [ref=f24e355] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJangGok_temple_in_Cheongyang%2C_South_Korea.jpg
            - text: · Ryuch · CC BY-SA 4.0
          - listitem [ref=f24e356]:
            - text: 홍성군 Hongseong Yongbongsan ·
            - link "Yongbongsan 2005.JPG" [ref=f24e357] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AYongbongsan_2005.JPG
            - text: "· user:Albam한국어 유저: 알밤한대 · CC BY-SA 3.0"
          - listitem [ref=f24e358]:
            - text: 예산군 Yesan Sudeoksa ·
            - link "Sudeoksa Elephants.jpg" [ref=f24e359] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASudeoksa_Elephants.jpg
            - text: · Halifax Nomad · CC BY-SA 3.0
          - listitem [ref=f24e360]:
            - text: 태안군 Taean Sinduri dunes ·
            - link "Sindu sandhills image 2.jpg" [ref=f24e361] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASindu_sandhills_image_2.jpg
            - text: · Jjw · CC BY-SA 4.0
          - listitem [ref=f24e362]:
            - text: 목포시 Mokpo ·
            - link "Mokpo Music Fountain.jpg" [ref=f24e363] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMokpo_Music_Fountain.jpg
            - text: · Mar del Este · CC BY-SA 3.0
          - listitem [ref=f24e364]:
            - text: 나주시 금성관 ·
            - link "Naju City 25 (17097271748).jpg" [ref=f24e365] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ANaju_City_25_(17097271748).jpg
            - text: · Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0
          - listitem [ref=f24e366]:
            - text: 곡성군 Gokseong train village ·
            - link "Gokseong pretpark en spoorlijn 02.JPG" [ref=f24e367] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGokseong_pretpark_en_spoorlijn_02.JPG
            - text: · Smiley.toerist · CC BY-SA 4.0
          - listitem [ref=f24e368]:
            - text: 구례군 화엄사 ·
            - link "화엄사.jpg" [ref=f24e369] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%ED%99%94%EC%97%84%EC%82%AC.jpg
            - text: · 손묵광 · CC BY-SA 4.0
          - listitem [ref=f24e370]:
            - text: 보성군 Boseong green tea field ·
            - link "Boseong - Boseong3018.jpg" [ref=f24e371] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABoseong_-_Boseong3018.jpg
            - text: · lumoplank · CC0
          - listitem [ref=f24e372]:
            - text: 화순군 Hwasun ·
            - link "Seryangje reservoir Hwasun South Korea.jpg" [ref=f24e373] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASeryangje_reservoir_Hwasun_South_Korea.jpg
            - text: · Mar del Este This photo was taken with Samsung Galaxy S4 · CC BY-SA 4.0
          - listitem [ref=f24e374]:
            - text: 강진군 Gangjin Baengnyeonsa ·
            - link "KORAIL Gangjin Gun 26 (17097413889).jpg" [ref=f24e375] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKORAIL_Gangjin_Gun_26_(17097413889).jpg
            - text: · Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0
          - listitem [ref=f24e376]:
            - text: 영암군 Wolchulsan ·
            - link "Wolchulsan Cloud Bridge 3.jpg" [ref=f24e377] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AWolchulsan_Cloud_Bridge_3.jpg
            - text: · User:Jpbarrass · Public domain
          - listitem [ref=f24e378]:
            - text: 무안군 Muan ·
            - link "Muan rural view in 2026 (13).jpg" [ref=f24e379] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AMuan_rural_view_in_2026_(13).jpg
            - text: · Sadopaul · CC BY-SA 4.0
          - listitem [ref=f24e380]:
            - text: 함평군 Hampyeong butterfly festival ·
            - link "Hampyeong butterfly festival 007.JPG" [ref=f24e381] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHampyeong_butterfly_festival_007.JPG
            - text: · myself (User:Piotrus) · CC BY-SA 3.0
          - listitem [ref=f24e382]:
            - text: 영광군 Yeonggwang ·
            - link "Anma Fishing Port APR2021.jpg" [ref=f24e383] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AAnma_Fishing_Port_APR2021.jpg
            - text: · Gupdaal · CC BY 4.0
          - listitem [ref=f24e384]:
            - text: 장성군 Baegyangsa ·
            - link "Baekyangsa.JPG" [ref=f24e385] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABaekyangsa.JPG
            - text: · Dalgial · CC BY-SA 3.0
          - listitem [ref=f24e386]:
            - text: 완도군 청산도 ·
            - link "청산도의 봄.jpg" [ref=f24e387] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%B2%AD%EC%82%B0%EB%8F%84%EC%9D%98_%EB%B4%84.jpg
            - text: · 라성민 · CC BY-SA 3.0
          - listitem [ref=f24e388]:
            - text: 신안군 Sinan Jeungdo ·
            - link "KOCIS Jeungdo (Jeung Island), near Mokpo City (6285677586).jpg" [ref=f24e389] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKOCIS_Jeungdo_(Jeung_Island)%2C_near_Mokpo_City_(6285677586).jpg
            - text: · Korea.net / Korean Culture and Information Service · CC BY-SA 2.0
          - listitem [ref=f24e390]:
            - text: 포항시 Pohang Homigot ·
            - link "Homigot 20240113 003.jpg" [ref=f24e391] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHomigot_20240113_003.jpg
            - text: · Mobius6 · CC BY 4.0
          - listitem [ref=f24e392]:
            - text: 김천시 직지사 ·
            - link "직지사 대웅전.jpg" [ref=f24e393] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%A7%81%EC%A7%80%EC%82%AC_%EB%8C%80%EC%9B%85%EC%A0%84.jpg
            - text: · 최옥석 · CC BY-SA 4.0
          - listitem [ref=f24e394]:
            - text: 구미시 금오산 도립공원 ·
            - link "Geumomtcablecar.jpg" [ref=f24e395] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGeumomtcablecar.jpg
            - text: · Kimhs5400(블루시티) · CC BY-SA 4.0
          - listitem [ref=f24e396]:
            - text: 영주시 Buseoksa ·
            - link "Gwaneumjeon Hall at Buseoksa 01.jpg" [ref=f24e397] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGwaneumjeon_Hall_at_Buseoksa_01.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e398]:
            - text: 문경시 Mungyeong Saejae ·
            - link "Jhk (10)새재.jpg" [ref=f24e399] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJhk_(10)%EC%83%88%EC%9E%AC.jpg
            - text: · Jhkangphoto · CC BY-SA 3.0
          - listitem [ref=f24e400]:
            - text: 청송군 주왕산 국립공원 ·
            - link "주왕산2.jpg" [ref=f24e401] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%A3%BC%EC%99%95%EC%82%B02.jpg
            - text: · Kiduk Yang · CC BY-SA 3.0
          - listitem [ref=f24e402]:
            - text: 영덕군 Yeongdeok ·
            - link "영덕 동해바다.jpg" [ref=f24e403] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%98%81%EB%8D%95_%EB%8F%99%ED%95%B4%EB%B0%94%EB%8B%A4.jpg
            - text: · jbl4430 · CC BY 3.0
          - listitem [ref=f24e404]:
            - text: 청도군 Cheongdo Unmunsa ·
            - link "처진소나무.jpg" [ref=f24e405] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%B2%98%EC%A7%84%EC%86%8C%EB%82%98%EB%AC%B4.jpg
            - text: · 기여자 · CC0
          - listitem [ref=f24e406]:
            - text: 고령군 Goryeong Daegaya tombs ·
            - link "Korea-Gaya Royal tomb exhibition site.jpg" [ref=f24e407] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKorea-Gaya_Royal_tomb_exhibition_site.jpg
            - text: · 고령대가야박물관(http://www.daegaya.net/main/) · CC BY 4.0
          - listitem [ref=f24e408]:
            - text: 성주군 성주 성밖숲 ·
            - link "성주 경산리 성밖숲.jpg" [ref=f24e409] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%84%B1%EC%A3%BC_%EA%B2%BD%EC%82%B0%EB%A6%AC_%EC%84%B1%EB%B0%96%EC%88%B2.jpg
            - text: · 최옥석 · CC BY-SA 3.0
          - listitem [ref=f24e410]:
            - text: 예천군 Yecheon Hoeryongpo ·
            - link "Hoeryongpo.jpg" [ref=f24e411] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHoeryongpo.jpg
            - text: · w:ko:사용자:Salamander03's father · CC BY-SA 3.0
          - listitem [ref=f24e412]:
            - text: 울릉군 Dokdo ·
            - link "Dokdo-Tourists.JPG" [ref=f24e413] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADokdo-Tourists.JPG
            - text: · Ulleungdont · CC BY-SA 3.0
          - listitem [ref=f24e414]:
            - text: 진주시 Jinjuseong ·
            - link "Jinjuseong Fortress 02 - Gongbukmun Gate.jpg" [ref=f24e415] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJinjuseong_Fortress_02_-_Gongbukmun_Gate.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e416]:
            - text: 사천시 Sacheon Samcheonpo bridge ·
            - link "Samcheonpo Bridge (11) (12362358493).jpg" [ref=f24e417] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASamcheonpo_Bridge_(11)_(12362358493).jpg
            - text: · 영철 이 from 광주 광역시 · CC BY-SA 2.0
          - listitem [ref=f24e418]:
            - text: 김해시 Gimhae Gaya ·
            - link "Gimhaesi City 05 (17029041796).jpg" [ref=f24e419] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGimhaesi_City_05_(17029041796).jpg
            - text: · Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0
          - listitem [ref=f24e420]:
            - text: 밀양시 Yeongnamnu Miryang ·
            - link "영남루.jpg" [ref=f24e421] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%98%81%EB%82%A8%EB%A3%A8.jpg
            - text: · 최옥석 · CC BY-SA 4.0
          - listitem [ref=f24e422]:
            - text: 거제시 신선대 ·
            - link "GS-Ksp733.jpg" [ref=f24e423] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGS-Ksp733.jpg
            - text: · Dittwjfsdgkvkdjg · CC BY-SA 3.0
          - listitem [ref=f24e424]:
            - text: 양산시 Tongdosa ·
            - link "Paper lanterns at Tongdosa Temple 01.jpg" [ref=f24e425] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3APaper_lanterns_at_Tongdosa_Temple_01.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e426]:
            - text: 창녕군 우포늪 ·
            - link "우포늪 (Upo wetland).jpg" [ref=f24e427] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%9A%B0%ED%8F%AC%EB%8A%AA_(Upo_wetland).jpg
            - text: · Travel in Korea · CC BY-SA 3.0
          - listitem [ref=f24e428]:
            - text: 함양군 Hamyang ·
            - link "함양 팔령산성.png" [ref=f24e429] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%ED%95%A8%EC%96%91_%ED%8C%94%EB%A0%B9%EC%82%B0%EC%84%B1.png
            - text: · 사적돌 · CC BY 4.0
          - listitem [ref=f24e430]:
            - text: 합천군 해인사 ·
            - link "해인사.jpg" [ref=f24e431] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%ED%95%B4%EC%9D%B8%EC%82%AC.jpg
            - text: · 최옥석 · CC BY-SA 4.0
          - listitem [ref=f24e432]:
            - text: 원주시 Wonju ·
            - link "Korail Class 8000 Wonju - Sillim.jpg" [ref=f24e433] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKorail_Class_8000_Wonju_-_Sillim.jpg
            - text: · Kabelleger / David Gubler (http://www.bahnbilder.ch) · CC BY-SA 3.0
          - listitem [ref=f24e434]:
            - text: 동해시 Chuam Chotdaebawi ·
            - link "燭台嶼 Candlestick Rock - panoramio.jpg" [ref=f24e435] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%E7%87%AD%E5%8F%B0%E5%B6%BC_Candlestick_Rock_-_panoramio.jpg
            - text: · lienyuan lee · CC BY 3.0
          - listitem [ref=f24e436]:
            - text: 태백시 Taebaek Hwangji pond ·
            - link "Hwangji Pond Taebaek City 20260713 (01).jpg" [ref=f24e437] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AHwangji_Pond_Taebaek_City_20260713_(01).jpg
            - text: · Treeinkr · CC BY-SA 4.0
          - listitem [ref=f24e438]:
            - text: 삼척시 Samcheok Jangho port ·
            - link "한국의 나폴리 장호항.jpg" [ref=f24e439] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%ED%95%9C%EA%B5%AD%EC%9D%98_%EB%82%98%ED%8F%B4%EB%A6%AC_%EC%9E%A5%ED%98%B8%ED%95%AD.jpg
            - text: · 우한길(HK Woo) · CC BY 3.0
          - listitem [ref=f24e440]:
            - text: 영월군 Yeongwol Cheongnyeongpo ·
            - link "Korea Yeongwol Sketch 09 (8228244559).jpg" [ref=f24e441] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AKorea_Yeongwol_Sketch_09_(8228244559).jpg
            - text: · Korea.net / Korean Culture and Information Service (Jeon Han) · CC BY-SA 2.0
          - listitem [ref=f24e442]:
            - text: 평창군 Daegwallyeong sheep farm ·
            - link "Daegwallyeong Sheep Farm.jpg" [ref=f24e443] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ADaegwallyeong_Sheep_Farm.jpg
            - text: · Ken Eckert · CC BY-SA 4.0
          - listitem [ref=f24e444]:
            - text: 정선군 Jeongseon ·
            - link "Jeongseon Arirang Train 07 (15669611483).jpg" [ref=f24e445] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AJeongseon_Arirang_Train_07_(15669611483).jpg
            - text: · Republic of Korea from Seoul, Republic of Korea · CC BY-SA 2.0
          - listitem [ref=f24e446]:
            - text: 양양군 Naksansa ·
            - link "Bell Pavilion at Naksansa 01.jpg" [ref=f24e447] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ABell_Pavilion_at_Naksansa_01.jpg
            - text: · Bernard Gagnon · CC0
          - listitem [ref=f24e448]:
            - text: 고성군 Goseong Gangwon Hwajinpo ·
            - link "Goseong Hwajinpo Beach 20260418 (02).jpg" [ref=f24e449] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGoseong_Hwajinpo_Beach_20260418_(02).jpg
            - text: · Treeinkr · CC BY-SA 4.0
          - listitem [ref=f24e450]:
            - text: 군산시 근대역사박물관 ·
            - link "20240728 Iksan Modern History Museum 002.jpg" [ref=f24e451] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A20240728_Iksan_Modern_History_Museum_002.jpg
            - text: · Jjw · CC BY 4.0
          - listitem [ref=f24e452]:
            - text: 익산시 Iksan Wanggung-ri ·
            - link "왕궁 오층석탑.jpg" [ref=f24e453] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EC%99%95%EA%B6%81_%EC%98%A4%EC%B8%B5%EC%84%9D%ED%83%91.jpg
            - text: · Seong Ilhan · CC BY-SA 4.0
          - listitem [ref=f24e454]:
            - text: 정읍시 Naejangsan ·
            - link "Naejangsan Pavilion 1.jpg" [ref=f24e455] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ANaejangsan_Pavilion_1.jpg
            - text: · Tung Thanh Dang · CC BY-SA 3.0
          - listitem [ref=f24e456]:
            - text: 남원시 광한루원 ·
            - link "Gwanghallu Pavilion at Night- Namwon.jpg" [ref=f24e457] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGwanghallu_Pavilion_at_Night-_Namwon.jpg
            - text: · Macbest1982 · CC BY-SA 4.0
          - listitem [ref=f24e458]:
            - text: 김제시 금산사 ·
            - link "금산사 미륵전.jpg" [ref=f24e459] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EA%B8%88%EC%82%B0%EC%82%AC_%EB%AF%B8%EB%A5%B5%EC%A0%84.jpg
            - text: · Ahl0051 · CC BY-SA 4.0
          - listitem [ref=f24e460]:
            - text: 완주군 Wanju ·
            - link "Wanju county (autumn rice field ready for harvesting near Gui Lake)..JPG" [ref=f24e461] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AWanju_county_(autumn_rice_field_ready_for_harvesting_near_Gui_Lake)..JPG
            - text: · Shamus7792003 · CC BY-SA 4.0
          - listitem [ref=f24e462]:
            - text: 진안군 마이산 도립공원 ·
            - link "마이산.jpg" [ref=f24e463] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3A%EB%A7%88%EC%9D%B4%EC%82%B0.jpg
            - text: · Ji Yeon Song · CC BY-SA 3.0
          - listitem [ref=f24e464]:
            - text: 무주군 Muju ·
            - link "Trees rising out of Cheow Lan Lake, blue sky, eternal summer in Surat Thani edited.jpg" [ref=f24e465] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ATrees_rising_out_of_Cheow_Lan_Lake%2C_blue_sky%2C_eternal_summer_in_Surat_Thani_edited.jpg
            - text: "· Original: Vyacheslav Argenberg Derivative work: The Cosmonaut · CC BY 4.0"
          - listitem [ref=f24e466]:
            - text: 순창군 Sunchang ·
            - link "Sunchang Gaeksa 2.JPG" [ref=f24e467] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ASunchang_Gaeksa_2.JPG
            - text: · Leedkmn · CC BY-SA 3.0
          - listitem [ref=f24e468]:
            - text: 고창군 Gochang dolmen ·
            - link "Gochang Dolmens, South Korea.jpg" [ref=f24e469] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3AGochang_Dolmens%2C_South_Korea.jpg
            - text: · Lance Vanlewen · CC BY-SA 4.0
          - listitem [ref=f24e470]:
            - text: 부안군 채석강 ·
            - link "Caeseokgang beach to see at Suseongdang.jpg" [ref=f24e471] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACaeseokgang_beach_to_see_at_Suseongdang.jpg
            - text: · Jjw · CC BY-SA 4.0
          - listitem [ref=f24e472]:
            - text: 흘러가는 구름 (영상) ·
            - link "Cloud time lapse 1280.ogv" [ref=f24e473] [cursor=pointer]:
              - /url: https://commons.wikimedia.org/wiki/File%3ACloud_time_lapse_1280.ogv
            - text: · Error406 · Public domain
        - heading "지도 경계" [level=2] [ref=f24e474]
        - list [ref=f24e475]:
          - listitem [ref=f24e476]: 통계청 SGIS 행정구역 경계 (공공누리 1유형)
          - listitem [ref=f24e477]: vuski/admdongkor (CC BY 4.0)
          - listitem [ref=f24e478]: Natural Earth (퍼블릭 도메인)
        - heading "기후 자료" [level=2] [ref=f24e479]
        - paragraph [ref=f24e480]: NASA POWER 월별 기후값 (NASA Langley Research Center)
        - paragraph [ref=f24e481]: "지역 축제·관광지·무장애 정보와 관광지 사진: 한국관광공사 TourAPI (공공누리 제1유형). 매일 받아 씁니다."
        - paragraph [ref=f24e482]: "여행경보·입국허가요건: 외교부 해외안전여행(공공데이터포털). 매일 받아 씁니다. 떠나기 전 0404.go.kr에서 확인하세요."
        - paragraph [ref=f24e483]: "환율: 한국수출입은행 현재환율(매매기준율). 매일 받아 씁니다."
        - paragraph [ref=f24e484]: "장소 자리 찾기: OpenStreetMap Nominatim (© OpenStreetMap 기여자)."
      - generic [ref=f24e485]:
        - link "개인정보 처리방침" [ref=f24e486] [cursor=pointer]:
          - /url: /privacy
        - link "이용약관" [ref=f24e487] [cursor=pointer]:
          - /url: /terms
        - link "출처와 버전" [ref=f24e488] [cursor=pointer]:
          - /url: /credits
    - status
  - iframe [aria-hidden] [ref=f24e489]
```

# Test source

```ts
  206 |     await page.context().close();
  207 |   });
  208 | 
  209 |   test('한글 입력 중 Enter는 조합을 끝낼 뿐, 저장·선택하지 않는다 (IME)', async ({ browser }) => {
  210 |     const page = await phone(browser);
  211 |     await signIn(page);
  212 |     await page.goto('/record');
  213 | 
  214 |     // 장소 검색: 조합 중 Enter로 엉뚱한 첫 결과가 골라지면 안 된다
  215 |     await page.getByLabel('어디 검색').click();
  216 |     const place = await composeKorean(page, ['ㄱ', '가', '강', '강ㄹ', '강르', '강릉']);
  217 |     await page.keyboard.press('Enter');
  218 |     await place.commit('강릉');
  219 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toHaveCount(0);
  220 |     await expect(page.getByLabel('어디 검색')).toHaveValue('강릉');
  221 |     // 조합이 끝난 뒤 Enter는 첫 결과를 고른다
  222 |     await page.keyboard.press('Enter');
  223 |     await expect(page.getByRole('button', { name: /강릉시 빼기/ })).toBeVisible();
  224 | 
  225 |     // 함께 간 사람: 조합 중 Enter에 바로 추가되고 글자가 다시 남는 문제가 없어야 한다
  226 |     const who = page.getByLabel('함께 간 사람 이름');
  227 |     await who.click();
  228 |     const name = await composeKorean(page, ['ㅎ', '하', '할', '할ㅁ', '할머', '할머ㄴ', '할머니']);
  229 |     await page.keyboard.press('Enter');
  230 |     await name.commit('할머니');
  231 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(0);
  232 |     await expect(who).toHaveValue('할머니');
  233 |     await page.keyboard.press('Enter');
  234 |     await expect(page.getByRole('button', { name: '할머니', exact: true })).toHaveCount(1);
  235 |     await expect(who).toHaveValue('');
  236 |     await page.context().close();
  237 |   });
  238 | 
  239 |   test('PC: 사진을 끌어다 놓아 올리고, 사진이 아닌 파일은 거른다', async ({ browser }) => {
  240 |     const page = await desktop(browser);
  241 |     await signIn(page);
  242 |     // PC 양옆엔 흐린 배경 장면이 붙는다 (폰에선 없음)
  243 |     await expect(page.getByTestId('backdrop')).toBeAttached({ timeout: 10_000 });
  244 |     await page.goto('/record');
  245 |     await page.getByLabel('어디 검색').fill('단양');
  246 |     await page.getByRole('option', { name: /단양군/ }).first().click();
  247 |     await page.getByLabel('제목').fill('단양 끌어다 놓기 여행');
  248 |     await page.getByRole('button', { name: '몰라요' }).click();
  249 |     await page.getByTestId('save').click();
  250 |     await expect(page.getByTestId('trip-title')).toHaveText('단양 끌어다 놓기 여행');
  251 |     await page.getByRole('tab', { name: /사진/ }).click();
  252 |     await expect(page.getByTestId('photos-empty')).toBeVisible();
  253 |     const grid = page.getByTestId('photo-grid');
  254 | 
  255 |     const drag = (files: { name: string; type: string; b64: string }[]) =>
  256 |       page.evaluateHandle((fs) => {
  257 |         const dt = new DataTransfer();
  258 |         for (const f of fs) dt.items.add(new File([Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0))], f.name, { type: f.type }));
  259 |         return dt;
  260 |       }, files);
  261 | 
  262 |     // 글 파일은 올리지 않는다
  263 |     const txt = await drag([{ name: '메모.txt', type: 'text/plain', b64: Buffer.from('안녕').toString('base64') }]);
  264 |     await grid.dispatchEvent('dragenter', { dataTransfer: txt });
  265 |     await grid.dispatchEvent('dragover', { dataTransfer: txt });
  266 |     await grid.dispatchEvent('drop', { dataTransfer: txt });
  267 |     await expect(page.getByRole('status')).toContainText('사진 파일만 올릴 수 있어요');
  268 | 
  269 |     // 사진 파일: 끌고 오면 안내가 뜨고, 놓으면 올라간다
  270 |     const jpg = await drag([{ name: '단양.jpg', type: 'image/jpeg', b64: fs.readFileSync('tests/fixtures/photo-noexif.jpg').toString('base64') }]);
  271 |     await grid.dispatchEvent('dragenter', { dataTransfer: jpg });
  272 |     await grid.dispatchEvent('dragover', { dataTransfer: jpg });
  273 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toBeVisible();
  274 |     await grid.dispatchEvent('drop', { dataTransfer: jpg });
  275 |     await expect(page.getByText('여기에 놓으면 사진이 올라가요')).toHaveCount(0);
  276 |     await expect(page.getByRole('status')).toContainText('사진 1장을 올렸어요', { timeout: 40_000 });
  277 |     await expect(grid.locator('.photo-cell img[data-loaded]')).toHaveCount(1);
  278 |     await expect(page.getByTestId('photos-empty')).toHaveCount(0);
  279 | 
  280 |     // 새로 고침해도 사진이 남아 있다
  281 |     await page.reload();
  282 |     await page.getByRole('tab', { name: /사진/ }).click();
  283 |     await expect(page.getByTestId('photo-grid').locator('.photo-cell img[data-loaded]')).toHaveCount(1, { timeout: 20_000 });
  284 |     await page.context().close();
  285 |   });
  286 | 
  287 |   test('375px: 어느 화면도 옆으로 넘치지 않는다', async ({ browser }) => {
  288 |     const page = await phone(browser);
  289 |     await page.goto('/');
  290 |     await expect(page.getByTestId('login')).toBeVisible();
  291 |     const found: string[] = [];
  292 |     const check = async (where: string) => {
  293 |       const o = await overflowing(page);
  294 |       if (o.page) found.push(`${where}: ${o.page}`);
  295 |       for (const b of o.bad) found.push(`${where}: ${b}`);
  296 |     };
  297 |     await check('로그인');
  298 |     await signIn(page);
  299 |     const trip = await page.evaluate(() => document.querySelector<HTMLAnchorElement>('a[href^="/trips/"]')?.getAttribute('href'));
  300 |     for (const route of ['/', '/trips', ...(trip ? [trip] : []), '/record', '/map', '/wishes', '/places', '/memories', '/ask', '/space', '/admin', '/credits']) {
  301 |       await page.goto(route);
  302 |       await page.waitForLoadState('load');
  303 |       await page.waitForTimeout(900);
  304 |       await check(route);
  305 |     }
> 306 |     expect(found, found.join('\n')).toEqual([]);
      |                                     ^ Error: /record: 가로 스크롤 377px > 375px
  307 |     await page.context().close();
  308 |   });
  309 | 
  310 |   test('가고 싶은 곳: 누가 원해요·참고 링크만 바꿔도, 저장하지 않고 나가면 한 번 묻는다', async ({ browser }) => {
  311 |     const page = await phone(browser);
  312 |     await signIn(page);
  313 |     await page.goto('/wishes/new');
  314 |     await page.getByLabel('어디 검색').fill('남해');
  315 |     await page.getByRole('option', { name: /남해군/ }).first().click();
  316 |     await page.getByTestId('wish-save').click();
  317 |     await expect(page).toHaveURL(/\/wishes$/);
  318 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  319 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  320 |     const back = page.getByRole('button', { name: '뒤로' });
  321 | 
  322 |     // 아무것도 안 바꿨으면 묻지 않고 나간다
  323 |     let asked = '';
  324 |     page.on('dialog', (d) => {
  325 |       asked = d.message();
  326 |       void d.dismiss();
  327 |     });
  328 |     await back.click();
  329 |     await expect(page).toHaveURL(/\/wishes$/);
  330 |     expect(asked).toBe('');
  331 | 
  332 |     // '누가 원해요'만 바꿔도 묻는다 (취소하면 그대로 머문다)
  333 |     await page.getByRole('link', { name: /남해군.*가고 싶은 곳 보기/ }).first().click();
  334 |     await page.getByRole('button', { name: '보라', exact: true }).click();
  335 |     await back.click();
  336 |     await expect.poll(() => asked).toContain('저장하지 않은 내용');
  337 |     await expect(page).toHaveURL(/\/wishes\/[^/]+$/);
  338 |     await page.context().close();
  339 |   });
  340 | 
  341 |   test('장소 남기기: 고른 종류·평가에 체크 표시, 네이버지도 칸은 하나, 붙여 넣으면 링크 한 줄', async ({ browser }) => {
  342 |     const page = await phone(browser);
  343 |     await signIn(page);
  344 |     await page.goto('/places/new');
  345 |     // 네이버지도 입력 칸은 하나뿐
  346 |     await expect(page.getByLabel(/네이버/)).toHaveCount(1);
  347 |     // 고른 종류에만 눌림·체크 표시
  348 |     const food = page.getByRole('button', { name: '맛집', exact: true });
  349 |     const cafe = page.getByRole('button', { name: '카페', exact: true });
  350 |     await expect(food).toHaveAttribute('aria-pressed', 'true');
  351 |     await expect(food.locator('.chip-check')).toBeVisible();
  352 |     await cafe.click();
  353 |     await expect(cafe).toHaveAttribute('aria-pressed', 'true');
  354 |     await expect(food).toHaveAttribute('aria-pressed', 'false');
  355 |     await expect(food.locator('.chip-check')).toHaveCount(0);
  356 |     const again = page.getByRole('button', { name: '또 갈래요', exact: true });
  357 |     await again.click();
  358 |     await expect(again).toHaveAttribute('aria-pressed', 'true');
  359 |     await expect(again.locator('.chip-check')).toBeVisible();
  360 |     // 공유 글을 붙여 넣으면 이름·주소가 채워지고, 링크는 한 줄로 보인다 (입력 칸은 사라짐)
  361 |     await page.getByLabel('네이버지도 공유 글').fill('[네이버지도]\n칠곡 가산산성 카페\n경북 칠곡군 가산면 1\nhttps://naver.me/chilgok1');
  362 |     await expect(page.getByLabel('장소 이름')).toHaveValue('칠곡 가산산성 카페');
  363 |     await expect(page.getByLabel('주소')).toHaveValue('경북 칠곡군 가산면 1');
  364 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok1');
  365 |     await expect(page.getByLabel('네이버지도 공유 글')).toHaveCount(0);
  366 |     // 링크를 빼면 다시 붙여 넣을 수 있다
  367 |     await page.getByRole('button', { name: '네이버지도 링크 빼기' }).click();
  368 |     await expect(page.getByLabel('네이버지도 공유 글')).toBeVisible();
  369 |     await page.getByLabel('네이버지도 공유 글').fill('https://naver.me/chilgok2');
  370 |     await expect(page.getByTestId('naver-link')).toContainText('naver.me/chilgok2');
  371 |     await page.context().close();
  372 |   });
  373 | 
  374 |   test('우리 장소를 남기면 지도에 장소 표시가 뜨고, 다녀왔다고 고르면 핀도 꽂힌다', async ({ browser }) => {
  375 |     const page = await phone(browser);
  376 |     await signIn(page);
  377 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  378 |     const before = (await page.getByTestId('headline').textContent()) ?? '';
  379 |     // 여행 없이 장소만 (칠곡)
  380 |     await page.goto('/places/new');
  381 |     await page.getByLabel('장소 이름').fill('칠곡 호국평화기념관');
  382 |     await page.getByLabel('어디 검색').fill('칠곡');
  383 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  384 |     await page.getByTestId('place-save').click();
  385 |     // 저장이 끝난 뒤(알림이 뜬 뒤)에 홈으로 — 저장 중에 새로 고치면 사람도 기록을 잃는다
  386 |     await expect(page.getByRole('status')).toContainText('장소를 남겼어요');
  387 |     await page.goto('/');
  388 |     await expect(page.getByTestId('map').first()).toHaveAttribute('data-features', /^[1-9]\d*$/, { timeout: 20_000 });
  389 |     const spot = page.locator('[data-testid="place-spot"][data-code="47850"]');
  390 |     await expect(spot).toHaveCount(1);
  391 |     await expect(spot).toContainText('1');
  392 |     // 핀은 아직 없다 (다녀왔다고 하지 않았으니)
  393 |     await expect(page.getByTestId('headline')).toHaveText(before);
  394 |     // 장소를 하나 더 남기며 '여기 다녀왔어요'를 고르면 핀도 꽂힌다
  395 |     await page.goto('/places/new');
  396 |     await page.getByLabel('장소 이름').fill('칠곡 가산수피아');
  397 |     await page.getByLabel('어디 검색').fill('칠곡');
  398 |     await page.getByRole('option', { name: /칠곡군/ }).first().click();
  399 |     await page.getByLabel('여기 다녀왔어요 (지도에 핀도 꽂기)').check();
  400 |     await page.getByTestId('place-save').click();
  401 |     await expect(page.getByRole('status')).toContainText('장소를 남기고 핀도 꽂았어요');
  402 |     await page.goto('/');
  403 |     await expect(page.locator('[data-testid="place-spot"][data-code="47850"]')).toContainText('2');
  404 |     await expect(page.getByTestId('headline')).not.toHaveText(before);
  405 |     await page.context().close();
  406 |   });
```