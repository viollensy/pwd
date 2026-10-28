(function () {
  const photo = (file, src, alt, author, license = "CC BY-SA 4.0") => ({
    src,
    alt,
    author,
    license,
    source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file).replace(/%20/g, "_")}`,
    licenseUrl: license === "CC0"
      ? "https://creativecommons.org/publicdomain/zero/1.0/"
      : "https://creativecommons.org/licenses/by-sa/4.0/",
  });

  window.CarPhotoGalleries = {
    "Suzuki Ertiga": [
      photo(
        "2018 Suzuki Ertiga GX (front), Batu City.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/55/2018_Suzuki_Ertiga_GX_%28front%29%2C_Batu_City.jpg/960px-2018_Suzuki_Ertiga_GX_%28front%29%2C_Batu_City.jpg",
        "Suzuki Ertiga, tampak depan",
        "Alex Neman"
      ),
      photo(
        "2018 Suzuki Ertiga GX (rear), Batu City.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/2018_Suzuki_Ertiga_GX_%28rear%29%2C_Batu_City.jpg/960px-2018_Suzuki_Ertiga_GX_%28rear%29%2C_Batu_City.jpg",
        "Suzuki Ertiga, tampak belakang",
        "Alex Neman"
      ),
      photo(
        "2019 Suzuki Ertiga Interior.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/2019_Suzuki_Ertiga_Interior.jpg/960px-2019_Suzuki_Ertiga_Interior.jpg",
        "Interior Suzuki Ertiga",
        "Areaseven"
      ),
    ],
    "Honda Brio": [
      photo(
        "2016 Honda Brio Satya E (facelift) (front), West Surabaya.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/2016_Honda_Brio_Satya_E_%28facelift%29_%28front%29%2C_West_Surabaya.jpg/960px-2016_Honda_Brio_Satya_E_%28facelift%29_%28front%29%2C_West_Surabaya.jpg",
        "Honda Brio Satya, tampak depan",
        "Alex Neman"
      ),
      photo(
        "2016 Honda Brio Satya E (facelift) (rear), West Surabaya.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/2016_Honda_Brio_Satya_E_%28facelift%29_%28rear%29%2C_West_Surabaya.jpg/960px-2016_Honda_Brio_Satya_E_%28facelift%29_%28rear%29%2C_West_Surabaya.jpg",
        "Honda Brio Satya, tampak belakang",
        "Alex Neman"
      ),
      photo(
        "2023 Honda Brio Satya 1.2 E in Rallye Red (Interior).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/2023_Honda_Brio_Satya_1.2_E_in_Rallye_Red_%28Interior%29.jpg/960px-2023_Honda_Brio_Satya_1.2_E_in_Rallye_Red_%28Interior%29.jpg",
        "Interior Honda Brio Satya",
        "MoCars",
        "CC0"
      ),
    ],
    "Honda HR-V e:HEV RS": [
      photo(
        "2022 Honda HR-V 1.5 E (Indonesia) front view.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/2022_Honda_HR-V_1.5_E_%28Indonesia%29_front_view.jpg/960px-2022_Honda_HR-V_1.5_E_%28Indonesia%29_front_view.jpg",
        "Honda HR-V generasi terbaru, tampak depan",
        "Andra Febrian"
      ),
      photo(
        "Honda HR-V RV4 1.5 RS e-HEV Sand Khaki Pearl - rear.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Honda_HR-V_RV4_1.5_RS_e-HEV_Sand_Khaki_Pearl_-_rear.jpg/960px-Honda_HR-V_RV4_1.5_RS_e-HEV_Sand_Khaki_Pearl_-_rear.jpg",
        "Honda HR-V e:HEV RS, tampak belakang",
        "Ethan Llamas"
      ),
      photo(
        "Honda HR-V RV4 1.5 RS e-HEV interior.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Honda_HR-V_RV4_1.5_RS_e-HEV_interior.jpg/960px-Honda_HR-V_RV4_1.5_RS_e-HEV_interior.jpg",
        "Interior Honda HR-V e:HEV RS",
        "Ethan Llamas"
      ),
    ],
    "Toyota Innova Zenix": [
      photo(
        "2022 Toyota Kijang Innova Zenix V (front).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/2022_Toyota_Kijang_Innova_Zenix_V_%28front%29.jpg/960px-2022_Toyota_Kijang_Innova_Zenix_V_%28front%29.jpg",
        "Toyota Kijang Innova Zenix, tampak depan",
        "Alex Neman"
      ),
      photo(
        "2022 Toyota Kijang Innova Zenix V (rear).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/2022_Toyota_Kijang_Innova_Zenix_V_%28rear%29.jpg/960px-2022_Toyota_Kijang_Innova_Zenix_V_%28rear%29.jpg",
        "Toyota Kijang Innova Zenix, tampak belakang",
        "Alex Neman"
      ),
      photo(
        "2022 Toyota Kijang Innova Zenix G HV Interior (MAGH10; 11-25-2022).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/2022_Toyota_Kijang_Innova_Zenix_G_HV_Interior_%28MAGH10%3B_11-25-2022%29.jpg/960px-2022_Toyota_Kijang_Innova_Zenix_G_HV_Interior_%28MAGH10%3B_11-25-2022%29.jpg",
        "Interior Toyota Kijang Innova Zenix",
        "Nathanferdinand"
      ),
    ],
    "Toyota Rush": [
      photo(
        "Toyota Rush (Front), Jakarta, Indonesia.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Toyota_Rush_%28Front%29%2C_Jakarta%2C_Indonesia.jpg/960px-Toyota_Rush_%28Front%29%2C_Jakarta%2C_Indonesia.jpg",
        "Toyota Rush, tampak depan",
        "RichardSummersault",
        "CC0"
      ),
      photo(
        "Toyota Rush (Rear), Jakarta, Indonesia.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Toyota_Rush_%28Rear%29%2C_Jakarta%2C_Indonesia.jpg/960px-Toyota_Rush_%28Rear%29%2C_Jakarta%2C_Indonesia.jpg",
        "Toyota Rush, tampak belakang",
        "RichardSummersault",
        "CC0"
      ),
      photo(
        "2022 Toyota Rush GR-S interior 20221010.jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/2022_Toyota_Rush_GR-S_interior_20221010.jpg/960px-2022_Toyota_Rush_GR-S_interior_20221010.jpg",
        "Interior Toyota Rush",
        "Ethan Llamas"
      ),
    ],
    "Toyota Camry": [
      photo(
        "2020 Toyota Camry 2.5 (Front view).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/2020_Toyota_Camry_2.5_%28Front_view%29.jpg/960px-2020_Toyota_Camry_2.5_%28Front_view%29.jpg",
        "Toyota Camry 2020, tampak depan",
        "AIMHO'S REBELLION 8490s"
      ),
      photo(
        "2020 Toyota Camry 2.5 (Rear View).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/2020_Toyota_Camry_2.5_%28Rear_View%29.jpg/960px-2020_Toyota_Camry_2.5_%28Rear_View%29.jpg",
        "Toyota Camry 2020, tampak belakang",
        "AIMHO'S REBELLION 8490s"
      ),
      photo(
        "2020 Toyota Camry 2.5 (Interior).jpg",
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/2020_Toyota_Camry_2.5_%28Interior%29.jpg/960px-2020_Toyota_Camry_2.5_%28Interior%29.jpg",
        "Interior Toyota Camry 2020",
        "AIMHO'S REBELLION 8490s"
      ),
    ],
  };
})();
