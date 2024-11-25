# WEBRTC SMILEY

ana site server (https 5000)
```bash
npx ssl-serve --ssl
```

docker ile
```bash
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -v $(pwd):/data -w /data -p 5000:5000 node:20.15.0-bookworm-slim npx ssl-serve --ssl
```

sqlite testleri (http 3000)
```bash
npx serve sqlite-wasm-3470000\
```

##### Sertifika Oluşturmak
https://github.com/FiloSottile/mkcert

webrtc bağlantı kurulması
1. iki cihaz da aynı siteye girecek. (farklı serverlarda çalışan aynı siteye de girebiliyor. ör: pc localhosttaki kendi serverına girerken, telefon raspberryde çalışan başka bir servera girebiliyor. önemli olan sdp değişimi. yani iki tarafın da bana şu şekilde ulaşabilirsin diyebilmesi lazım.)
2. arama yapacak cihaz call'a basıcak. (create offer)
3. oluşan offer'ı diğer makina sahibine gönderecek (whatsapp vs. ile ver)
4. diğer makina, offer alanına bunu yapıştırıp answer'a basacak (create answer. aslında create answera basmak call yapan cihazı kabul etme anlamına geliyor. yani an itibariyle answer diyen bağlanmaya razı oldu. şimdi sıra offer'ı oluşturanın bu answer'ı kabul edip etmeyeceğinde.)
5. oluşan answer'ı ilk makinaya gönder (whatsapp vs. ile ver)
6. ilk makinada gelen answer SDP'yi answer yerine yapıştırıp accept'e bas.
7. bağlantı kuruldu. smileylere basın birbirinize göndereceksiniz.