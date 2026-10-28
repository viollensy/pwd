const cards = [...document.querySelectorAll(".car-card")];
    const filters = [...document.querySelectorAll(".filter")];
    const locationSelect = document.querySelector("#location");
    const toast = document.querySelector("#toast");
    const checkoutDialog = document.querySelector("#checkout-dialog");
    const carHighlights = {
      "Toyota Avanza": {
        benefit: "Kabin fleksibel untuk keluarga dan perjalanan bersama.",
        consideration: "Saat semua kursi terisi, ruang bagasi bisa lebih terbatas."
      },
      "Honda Brio": {
        benefit: "Bodi ringkas, praktis untuk bermanuver di area perkotaan.",
        consideration: "Kapasitas kabin dan bagasi lebih terbatas untuk rombongan."
      },
      "Mitsubishi Xpander": {
        benefit: "Kabin lega untuk perjalanan keluarga.",
        consideration: "Bodinya lebih besar, jadi perlu perhatian ekstra saat parkir."
      },
      "Toyota Innova Zenix": {
        benefit: "Kabin lapang dan nyaman untuk perjalanan bersama.",
        consideration: "Tarif sewanya lebih tinggi dibanding mobil keluarga kelas umum."
      },
      "Toyota Rush": {
        benefit: "Posisi duduk lebih tinggi dan kapasitas hingga 7 penumpang.",
        consideration: "Jika semua kursi dipakai, ruang bagasi dapat berkurang."
      },
      "Mercedes-Benz C-Class": {
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

    document.querySelectorAll(".hero-photo, .car-image").forEach((image) => {
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = image.classList.contains("hero-photo")
        ? "image-trigger image-trigger--hero"
        : "image-trigger";
      trigger.setAttribute("aria-label", `Perbesar foto: ${image.alt}`);
      image.parentElement.insertBefore(trigger, image);
      trigger.append(image);

      trigger.addEventListener("click", () => {
        imageDialogPhoto.src = image.currentSrc || image.src;
        imageDialogPhoto.alt = image.alt;
        imageDialogCaption.textContent = image.alt;
        imageDialog.showModal();
      });
    });

    document.querySelector("#image-dialog-close").addEventListener("click", () => imageDialog.close());

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
        document.querySelector("#checkout-total").textContent = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0
        }).format(dailyPrice * days);
        checkoutDialog.showModal();
      });
    });

    document.querySelector("#checkout-close").addEventListener("click", () => checkoutDialog.close());

    checkoutDialog.addEventListener("click", (event) => {
      if (event.target === checkoutDialog) checkoutDialog.close();
    });

    document.querySelector("#checkout-form").addEventListener("submit", (event) => {
      event.preventDefault();
      if (!selectedCar) {
        showToast("Pilih mobil terlebih dahulu.");
        checkoutDialog.close();
        return;
      }
      const paymentMethod = new FormData(event.currentTarget).get("payment-method");
      checkoutDialog.close();
      event.currentTarget.reset();
      showToast(`Simulasi pesanan ${selectedCar.name} berhasil dibuat dengan ${paymentMethod}. Pembayaran tidak diproses.`);
    });

    document.querySelector("#year").textContent = new Date().getFullYear();
