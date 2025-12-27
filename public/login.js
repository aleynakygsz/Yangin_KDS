const API_URL = 'http://localhost:3000/api';

// Sayfa yüklendiğinde oturum kontrolü
document.addEventListener('DOMContentLoaded', function() {
    // Eğer zaten giriş yapmışsa, dashboard'a yönlendir
    if (sessionStorage.getItem('kullanici')) {
        window.location.href = '/yangin.html';
    }
});

// Form submit
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const sifre = document.getElementById('sifre').value;
    const hataMsg = document.getElementById('hataMsg');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Hata mesajını gizle
    hataMsg.style.display = 'none';
    
    // Loading durumu
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/giris`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, sifre })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Kullanıcı bilgisini session'a kaydet
            sessionStorage.setItem('kullanici', JSON.stringify(data.kullanici));
            
            // Başarılı animasyonu
            submitBtn.innerHTML = '<span>✅ Giriş Başarılı!</span>';
            
            // Dashboard'a yönlendir
            setTimeout(() => {
                window.location.href = '/yangin.html';
            }, 1000);
            
        } else {
            // Hata mesajı göster
            hataMsg.textContent = data.message || 'Giriş başarısız!';
            hataMsg.style.display = 'block';
            
            // Loading'i kaldır
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Giriş hatası:', error);
        hataMsg.textContent = 'Sunucu hatası! Lütfen tekrar deneyin.';
        hataMsg.style.display = 'block';
        
        // Loading'i kaldır
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});