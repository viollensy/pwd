const cards = [...document.querySelectorAll(".car-card")];
    const filters = [...document.querySelectorAll(".filter")];
    const locationSelect = document.querySelector("#location");
    const toast = document.querySelector("#toast");
    const checkoutDialog = document.querySelector("#checkout-dialog");
    const checkoutContent = document.querySelector("#checkout-content");
    const transactionResult = document.querySelector("#transaction-result");
    const checkoutTitle = document.querySelector("#checkout-title");
    const checkoutEyebrow = document.querySelector("#checkout-eyebrow");
    const qrisPanel = document.querySelector("#qris-panel");
    const vaBankField = document.querySelector("#va-bank-field");
    const vaReceipt = document.querySelector("#va-receipt");
    const databaseReady = window.RentalDatabase?.isConfigured() ?? false;
    const checkoutSubmitButton = document.querySelector("#checkout-form button[type='submit']");
    const carHighlights = {
      "Suzuki Ertiga": {
        benefit: "Kabin fleksibel untuk keluarga dan perjalanan bersama.",
        consideration: "Saat semua kursi terisi, ruang bagasi bisa lebih terbatas."
      },
      "Honda Brio": {
        benefit: "Bodi ringkas, praktis untuk bermanuver di area perkotaan.",
        consideration: "Kapasitas kabin dan bagasi lebih terbatas untuk rombongan."
      },
      "Honda HR-V e:HEV RS": {
        benefit: "Posisi duduk tinggi dan sistem hybrid untuk perjalanan yang nyaman.",
        consideration: "Kapasitasnya 5 penumpang, berbeda dari MPV 7 penumpang."
      },
      "Toyota Innova Zenix": {
        benefit: "Kabin lapang dan nyaman untuk perjalanan bersama.",
        consideration: "Tarif sewanya lebih tinggi dibanding mobil keluarga kelas umum."
      },
      "Toyota Rush": {
        benefit: "Posisi duduk lebih tinggi dan kapasitas hingga 7 penumpang.",
        consideration: "Jika semua kursi dipakai, ruang bagasi dapat berkurang."
      },
      "Toyota Camry": {
        benefit: "Kenyamanan dan nuansa premium untuk perjalanan bisnis atau spesial.",
        consideration: "Tarif sewa dan kebutuhan biaya perjalanan cenderung lebih tinggi."
      }
    };
    let activeCategory = "all";
    let toastTimer;
    let selectedCar;

    cards.forEach((card) => {
      const carName = card.querySelector(".car-title-row h3").textContent.trim();
      const highlights = carHighlights[carName];
      if (!highlights) return;

      const section = document.createElement("div");
      section.className = "car-highlights";
      section.setAttribute("aria-label", `Kelebihan dan pertimbangan ${carName}`);

      [
        ["Kelebihan", highlights.benefit, "highlight-benefit"],
        ["Pertimbangan", highlights.consideration, "highlight-consideration"]
      ].forEach(([label, text, className]) => {
        const item = document.createElement("p");
        item.className = `car-highlight ${className}`;
        const heading = document.createElement("strong");
        heading.textContent = label;
        const description = document.createElement("span");
        description.textContent = text;
        item.append(heading, description);
        section.append(item);
      });

      const note = document.createElement("small");
      note.className = "car-highlight-note";
      note.textContent = "Info umum model; detail unit dapat berbeda.";
      section.append(note);
      card.querySelector(".car-bottom").before(section);
    });

    const imageDialog = document.querySelector("#image-dialog");
    const imageDialogPhoto = document.querySelector("#image-dialog-photo");
    const imageDialogCaption = document.querySelector("#image-dialog-caption");
    const imageDialogCount = document.querySelector("#image-dialog-count");
    const imageDialogCredit = document.querySelector("#image-dialog-credit");
    const carPhotoGalleries = window.CarPhotoGalleries;
    let activeGallery = [];
    let activeGalleryIndex = 0;
    let galleryTouchStart = null;

    function updatePhotoCredit(photo) {
      imageDialogCredit.replaceChildren();
      if (!photo.author || !photo.source) return;
      imageDialogCredit.append(
        document.createTextNode("Foto: "),
        Object.assign(document.createElement("a"), {
          href: photo.source,
          target: "_blank",
          rel: "noopener noreferrer",
          textContent: photo.author,
        }),
        document.createTextNode(" · "),
        Object.assign(document.createElement("a"), {
          href: photo.licenseUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          textContent: photo.license,
        })
      );
    }

    function updateGalleryImage() {
      const photo = activeGallery[activeGalleryIndex];
      imageDialogPhoto.src = photo.src;
      imageDialogPhoto.alt = photo.alt || "Foto mobil";
      imageDialogCaption.textContent = photo.alt || "Foto mobil";
      imageDialogCount.textContent = `${activeGalleryIndex + 1} / ${activeGallery.length}`;
      updatePhotoCredit(photo);
      document.querySelector("#image-dialog-hint").textContent =
        "Foto referensi; tahun atau varian bisa berbeda dari unit sewa.";
      document.querySelector("#image-dialog-previous").disabled = activeGallery.length < 2;
      document.querySelector("#image-dialog-next").disabled = activeGallery.length < 2;
    }

    function moveGallery(step) {
      if (activeGallery.length < 2) return;
      activeGalleryIndex = (activeGalleryIndex + step + activeGallery.length) % activeGallery.length;
      updateGalleryImage();
    }

    document.querySelectorAll(".hero-photo, .car-image").forEach((image) => {
      const carName = image.closest(".car-card")?.querySelector(".car-title-row h3")?.textContent.trim();
      const gallery = carPhotoGalleries[carName];
      if (gallery) {
        image.src = gallery[0].src;
        image.alt = gallery[0].alt;
      }
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = image.classList.contains("hero-photo")
        ? "image-trigger image-trigger--hero"
        : "image-trigger";
      trigger.setAttribute("aria-label", `Perbesar foto: ${image.alt}`);
      image.parentElement.insertBefore(trigger, image);
      trigger.append(image);

      trigger.addEventListener("click", () => {
        activeGallery = gallery || [{ src: image.currentSrc || image.src, alt: image.alt }];
        activeGalleryIndex = 0;
        updateGalleryImage();
        imageDialog.showModal();
      });
    });

    document.querySelector("#image-dialog-close").addEventListener("click", () => imageDialog.close());
    document.querySelector("#image-dialog-previous").addEventListener("click", () => moveGallery(-1));
    document.querySelector("#image-dialog-next").addEventListener("click", () => moveGallery(1));
    imageDialogPhoto.addEventListener("touchstart", (event) => {
      galleryTouchStart = event.changedTouches[0].clientX;
    }, { passive: true });
    imageDialogPhoto.addEventListener("touchend", (event) => {
      if (galleryTouchStart === null) return;
      const distance = event.changedTouches[0].clientX - galleryTouchStart;
      if (Math.abs(distance) > 45) moveGallery(distance > 0 ? -1 : 1);
      galleryTouchStart = null;
    }, { passive: true });
    imageDialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") moveGallery(-1);
      if (event.key === "ArrowRight") moveGallery(1);
    });

    imageDialog.addEventListener("click", (event) => {
      if (event.target === imageDialog) imageDialog.close();
    });
    const typingText = document.querySelector("#typing-text");
    const typingPhrases = ["lebih nyaman.", "bebas ribet.", "siap berangkat."];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion) {
      let phraseIndex = 0;
      let characterIndex = typingPhrases[0].length;
      let deleting = false;

      function typeNextCharacter() {
        const phrase = typingPhrases[phraseIndex];
        typingText.textContent = phrase.slice(0, characterIndex);

        if (!deleting && characterIndex === phrase.length) {
          deleting = true;
          window.setTimeout(typeNextCharacter, 1500);
          return;
        }

        if (deleting && characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typingPhrases.length;
          window.setTimeout(typeNextCharacter, 250);
          return;
        }

        characterIndex += deleting ? -1 : 1;
        window.setTimeout(typeNextCharacter, deleting ? 42 : 82);
      }

      window.setTimeout(typeNextCharacter, 1600);
    }

    function getRentalDays(pickup, returning) {
      const [pickupYear, pickupMonth, pickupDay] = pickup.split("-").map(Number);
      const [returnYear, returnMonth, returnDay] = returning.split("-").map(Number);
      const pickupTime = Date.UTC(pickupYear, pickupMonth - 1, pickupDay);
      const returnTime = Date.UTC(returnYear, returnMonth - 1, returnDay);
      return Math.round((returnTime - pickupTime) / 86400000);
    }

    function formatDate(value) {
      const [year, month, day] = value.split("-").map(Number);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date(year, month - 1, day));
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }).format(amount);
    }

    function createDemoAccountNumber() {
      const digits = [];
      while (digits.length < 16) {
        const digit = String(Math.floor(Math.random() * 10));
        const lastTwoDigits = digits.slice(-2);
        if (lastTwoDigits.length === 2 && lastTwoDigits.every((previousDigit) => previousDigit === digit)) continue;
        digits.push(digit);
      }
      return digits.join("");
    }

    function updateCars() {
      const location = locationSelect.value;
      let visibleCount = 0;
      cards.forEach((card) => {
        const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
        const matchesLocation = location === "all" || card.dataset.location === location;
        card.hidden = !(matchesCategory && matchesLocation);
        if (!card.hidden) visibleCount++;
      });
      document.querySelector(".empty-state")?.remove();
      if (!visibleCount) {
        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent = "Belum ada mobil untuk pilihan ini. Coba kategori atau lokasi lain.";
        document.querySelector("#car-grid").append(message);
      }
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("visible"), 3800);
    }

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        filters.forEach((item) => item.classList.remove("active"));
        filter.classList.add("active");
        activeCategory = filter.dataset.filter;
        updateCars();
      });
    });

    document.querySelector("#search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const pickup = document.querySelector("#pickup-date").value;
      const returning = document.querySelector("#return-date").value;
      if (pickup && returning && returning <= pickup) {
        showToast("Tanggal selesai harus setelah tanggal mulai.");
        return;
      }
      updateCars();
      document.querySelector("#armada").scrollIntoView({ behavior: "smooth" });
      const locationName = locationSelect.options[locationSelect.selectedIndex].text;
      showToast(`Menampilkan armada${locationSelect.value === "all" ? "" : ` di ${locationName}`}. Hubungi kami untuk konfirmasi ketersediaan tanggal.`);
    });

    document.querySelectorAll(".rent-button").forEach((button) => {
      button.addEventListener("click", () => {
        const pickup = document.querySelector("#pickup-date").value;
        const returning = document.querySelector("#return-date").value;
        if (!pickup || !returning) {
          showToast("Pilih tanggal mulai dan selesai sebelum melanjutkan pemesanan.");
          document.querySelector("#pickup-date").focus();
          return;
        }
        if (returning <= pickup) {
          showToast("Tanggal selesai harus setelah tanggal mulai.");
          document.querySelector("#return-date").focus();
          return;
        }

        const days = getRentalDays(pickup, returning);
        const dailyPrice = Number(button.dataset.price.replace(/\D/g, ""));
        selectedCar = {
          name: button.dataset.car,
          dailyPrice,
          pickup,
          returning,
          days
        };
        document.querySelector("#checkout-car").textContent = selectedCar.name;
        document.querySelector("#checkout-dates").textContent = `${formatDate(pickup)} - ${formatDate(returning)}`;
        document.querySelector("#checkout-duration").textContent = `${days} hari`;
        document.querySelector("#checkout-total").textContent = formatCurrency(dailyPrice * days);
        checkoutTitle.textContent = "Detail pemesanan";
        checkoutEyebrow.textContent = "Satu langkah lagi";
        qrisPanel.hidden = true;
        vaReceipt.hidden = true;
        vaBankField.hidden = false;
        checkoutContent.hidden = false;
        transactionResult.hidden = true;
        checkoutDialog.showModal();
      });
    });

    document.querySelector("#checkout-close").addEventListener("click", () => checkoutDialog.close());

    document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
      input.addEventListener("change", () => {
        qrisPanel.hidden = input.value !== "QRIS" || !input.checked;
        vaBankField.hidden = input.value !== "Virtual Account" || !input.checked;
      });
    });

    checkoutDialog.addEventListener("click", (event) => {
      if (event.target === checkoutDialog) checkoutDialog.close();
    });

    document.querySelector("#checkout-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!selectedCar) {
        showToast("Pilih mobil terlebih dahulu.");
        checkoutDialog.close();
        return;
      }
      const form = event.currentTarget;
      const submitButton = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);
      const total = selectedCar.dailyPrice * selectedCar.days;
      const isQris = formData.get("payment-method") === "QRIS";
      const isVirtualAccount = formData.get("payment-method") === "Virtual Account";
      let savedOrder = null;
      submitButton.disabled = true;
      submitButton.textContent = "Menyimpan pesanan...";
      try {
        if (databaseReady) {
          savedOrder = await window.RentalDatabase.createOrder({
            customerName: formData.get("customer-name"),
            customerPhone: formData.get("customer-phone"),
            carName: selectedCar.name,
            pickupDate: selectedCar.pickup,
            returnDate: selectedCar.returning,
            paymentMethod: formData.get("payment-method"),
            paymentBank: isVirtualAccount ? formData.get("va-bank") : null
          });
        }
      } catch (error) {
        showToast(`Pesanan gagal disimpan: ${error.message}`);
        return;
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Buat ringkasan demo";
      }

      const finalTotal = savedOrder?.total_amount ?? total;
      document.querySelector("#receipt-reference").textContent = savedOrder?.reference
        ?? `RR-DEMO-${window.crypto?.randomUUID ? window.crypto.randomUUID().slice(0, 8).toUpperCase() : Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      document.querySelector("#receipt-customer").textContent = formData.get("customer-name");
      document.querySelector("#receipt-phone").textContent = formData.get("customer-phone");
      document.querySelector("#receipt-car").textContent = selectedCar.name;
      document.querySelector("#receipt-dates").textContent = `${formatDate(selectedCar.pickup)} - ${formatDate(selectedCar.returning)}`;
      document.querySelector("#receipt-duration").textContent = `${selectedCar.days} hari`;
      document.querySelector("#receipt-payment").textContent = formData.get("payment-method");
      document.querySelector("#receipt-daily-price").textContent = `${formatCurrency(savedOrder?.daily_price ?? selectedCar.dailyPrice)} × ${savedOrder?.rental_days ?? selectedCar.days} hari`;
      document.querySelector("#receipt-total").textContent = formatCurrency(finalTotal);
      vaReceipt.hidden = !isVirtualAccount;
      if (isVirtualAccount) {
        const bank = formData.get("va-bank");
        const demoAccountNumber = databaseReady ? null : createDemoAccountNumber();
        document.querySelector("#va-receipt-bank").textContent = `${bank} Virtual Account`;
        document.querySelector("#va-receipt-number").textContent = demoAccountNumber
          ? demoAccountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
          : "";
        document.querySelector("#va-receipt-number").parentElement.hidden = databaseReady;
        document.querySelector("#va-unavailable").hidden = !databaseReady;
        document.querySelector("#va-receipt-amount").textContent = formatCurrency(finalTotal);
        document.querySelector("#va-receipt-expiry").textContent = `Batas waktu simulasi: ${new Intl.DateTimeFormat("id-ID", {
          dateStyle: "long",
          timeStyle: "short"
        }).format(new Date(Date.now() + 24 * 60 * 60 * 1000))}`;
      }
      document.querySelector("#receipt-status-message").textContent = savedOrder
        ? "Pesanan tersimpan; pembayaran belum diverifikasi"
        : isQris
          ? "Pembayaran belum diverifikasi"
          : "Simulasi; belum dibayar";
      document.querySelector("#receipt-notice").textContent = savedOrder
        ? "Pesanan sudah tersimpan di database. Pembayaran belum diproses atau diverifikasi. Cek status dengan nomor referensi dan WhatsApp."
        : "Mode demo lokal: pesanan ini tidak tersimpan dan tidak bisa dicari dari halaman Cek Pesanan. Hubungkan Supabase untuk menyimpan riwayat.";
      checkoutContent.hidden = true;
      transactionResult.hidden = false;
      checkoutTitle.textContent = "Hasil transaksi";
      checkoutEyebrow.textContent = savedOrder ? "Pesanan tersimpan" : "Simulasi lokal";
      document.querySelector("#receipt-heading").textContent = savedOrder ? "Pesanan tersimpan" : "Ringkasan pesanan demo";
      form.reset();
    });

    document.querySelector("#va-copy-button").addEventListener("click", async () => {
      const accountNumber = document.querySelector("#va-receipt-number").textContent.replace(/\s/g, "");
      if (!navigator.clipboard?.writeText) {
        showToast("Fitur salin tidak tersedia di browser ini.");
        return;
      }
      try {
        await navigator.clipboard.writeText(accountNumber);
        showToast("Nomor VA demo disalin. Nomor ini tidak dapat digunakan untuk transfer.");
      } catch {
        showToast("Nomor tidak berhasil disalin. Silakan salin secara manual.");
      }
    });

    document.querySelector("#receipt-done").addEventListener("click", () => checkoutDialog.close());

    document.querySelector("#year").textContent = new Date().getFullYear();

    if (databaseReady) {
      checkoutSubmitButton.textContent = "Simpan pesanan";
      document.querySelector("#checkout-database-notice").textContent = "Pesanan akan disimpan ke database. Pembayaran tetap belum diproses atau diverifikasi karena payment gateway belum terhubung.";
    }
