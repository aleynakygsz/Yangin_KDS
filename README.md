# Yangın Risk Analizi Karar Destek Sistemi

## PROJENİN AMACI
 Bu proje Türkiye'de orman yangınlarıyla mücadelede orta düzey yöneticilere gelecek yangın sezonu öncesi veri temelli karar desteği sunmak amacıyla geliştirilmiştir 

## SENARYO
T.C. Orman Genel Müdürlüğü Orman Yangınlarıyla Mücadele
Dairesi Başkanlığı bünyesinde görev yapan orta düzey yöneticilerin, geçmiş yangın verilerinden ve 2024 yılı sıcaklık,nem,rüzgar verilerinden elde edilen ortalamalar bir formüle dökülerek her ile her gün için bir risk puanı ortaya çıkarılıyor bu veriler ışığında riskli illeri önceden tespit ederek kaynak ve müdahale planlaması
yapabilmesini amaçlamaktadır.

## KURULUM 
1-Node.js ve MySQL bilgisayara kurulur.
2-Proje dosyaları indirilir ve proje klasörüne girilir.
3-Gerekli paketler npm install komutu ile yüklenir.
4-MySQL üzerinde veritabanı ve tablolar oluşturulur.
5-Veritabanı bağlantı ayarları yapılır.
6-Sunucu npm start komutu ile çalıştırılır.

## Kullanılan Teknolojiler
- Node.js
- Express.js
- MySQL
- JavaScript
- HTML / CSS
- Chart.js
- Leaflet.js


## İş Kuralları
1-Yıl bazlı risk analizi kuralı
Sistem yalnızca 2024 yılı için il bazlı risk puanı hesaplaması yapar.
2024 dışındaki yıllar seçildiğinde iller için yalnızca temel bilgiler (il adı, orman varlığı) gösterilir, risk puanı ve yangın bilgisi üretilmez.

2-Maksimum risk puanı esas alma kuralı
Her il için ilgili yıl içerisindeki en yüksek risk puanı dikkate alınır.
Harita ve analizlerde, karar destek amacıyla maksimum risk değerine göre değerlendirme yapılır.

3-Risk–yangın ilişkisi kontrol kuralı
Bir ilde, risk puanının en yüksek olduğu tarihte yangın kaydı bulunuyorsa, o il için “yangın var” bilgisi true olarak işaretlenir.
Bu sayede risk tahminleri ile gerçekleşen yangınlar karşılaştırılabilir.

4-Kullanıcı doğrulama kuralı
Sisteme erişim için kullanıcıların e-posta ve şifre bilgilerinin veritabanında eşleşmesi zorunludur.
Eşleşme sağlanmazsa sisteme erişim engellenir ve kullanıcıya hata mesajı döndürülür.

5-İl bazlı analizlerde en az bir ilin seçilmesi zorunludur. İl seçilmeden karşılaştırmalı analiz yapılamaz.
6-Seçilen il için yangın verisi bulunmuyorsa yıllara göre kaybedilen alan analizi üretilmez.

## API ENDPOİNTLERİ 
-Kimlik Doğrulama 
| POST | /api/auth/giris | Kullanıcı giriş işlemi |
| POST | /api/auth/cikis | Kullanıcı çıkış işlemi |
| POST | /api/auth/ekle | Yeni kullanıcı ekleme |
| DELETE | /api/auth/sil/:id | Kullanıcı silme |

-İl Bazlı Analiz
| GET | /api/analiz/iller | İl listesini getirir |
| GET | /api/analiz/yillara-gore-yangin | Seçilen il için yıllara göre yangın sayıları |
| GET | /api/analiz/yillara-gore-alan | Seçilen il(ler) için yıllara göre kaybedilen alan |

-İstasyon Analiz
| GET | /api/istasyon/iller | İstasyonların bağlı olduğu illeri getirir |
| GET | /api/istasyon/yillik-mudahale | İstasyona göre yıllık müdahale sayıları |
| GET | /api/istasyon/ortalama-alan-kaybi | İstasyon başına ortalama alan kaybı |
| GET | /api/istasyon/mudahale-tipi-dagilim | Müdahale tipine göre dağılım |

-Yangın Analiz
| GET | /api/yangin/yillik-ozet | Seçilen yıla ait genel yangın özeti |
| GET | /api/yangin/yillik-trend | Yıllara göre yangın trendi |
| GET | /api/yangin/neden-dagilimi | Yangın nedenlerinin dağılımı |
| GET | /api/yangin/en-cok-yanan-iller | En çok yangın çıkan iller |
| GET | /api/yangin/alan-trendi | Yıllara göre kaybedilen alan trendi |
| GET | /api/yangin/harita-risk | İl bazlı risk ve yangın durumu (harita verisi) |