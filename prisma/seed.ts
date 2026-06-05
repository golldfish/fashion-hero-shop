import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as never);

function generateSalesRecords(
  sellerId: string,
  profile: "great" | "medium" | "poor"
) {
  const records = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Profil sprzedaży — realistyczne dane z trendem
    const dayOfWeek = date.getDay();
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.4 : 1.0;
    const progress = (89 - i) / 89; // 0 → 1 (od najstarszego do dziś)

    let baseUnits: number;
    let baseRevenue: number;
    let returnRate: number;

    if (profile === "great") {
      // Happy Boots: rosnąca sprzedaż, niskie zwroty (RR 3%)
      baseUnits = Math.round((8 + progress * 6) * weekendBoost + (Math.random() - 0.5) * 3);
      baseRevenue = baseUnits * 260;
      returnRate = 0.03;
    } else if (profile === "medium") {
      // Medium Mentors: stabilna sprzedaż, umiarkowane zwroty (RR 25%)
      baseUnits = Math.round((4 + Math.sin(progress * Math.PI * 2) * 1.5) * weekendBoost + (Math.random() - 0.5) * 2);
      baseRevenue = baseUnits * 100;
      returnRate = 0.25;
    } else {
      // Sad Penguins: spadająca sprzedaż, rosnące zwroty (RR 50%)
      baseUnits = Math.round(Math.max(1, (7 - progress * 4)) * weekendBoost + (Math.random() - 0.5) * 2);
      baseRevenue = baseUnits * 200;
      returnRate = 0.5;
    }

    const unitsSold = Math.max(0, baseUnits);
    const returns = Math.round(unitsSold * returnRate);

    records.push({ sellerId, date, unitsSold, revenue: baseRevenue, returns });
  }

  return records;
}

async function main() {
  await prisma.salesRecord.deleteMany();
  await prisma.promotedProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sellerAccount.deleteMany();
  await prisma.seller.deleteMany();

  // --- Happy Boots (RR 3%) ---
  const happyBoots = await prisma.seller.create({
    data: {
      name: "Happy Boots",
      slug: "happy-boots",
      description: "Najlepsze buty i szpilki w mieście",
      returnRate: 0.03,
      account: {
        create: {
          email: "happy.boots@fashionhero.pl",
          passwordHash: await bcrypt.hash("HappyBoots2024!", 10),
        },
      },
      products: {
        create: [
          {
            name: "Klasyczne Derby",
            slug: "happy-boots-klasyczne-derby",
            description: "Eleganckie buty derby ze skóry naturalnej, idealne na każdą okazję. Ręczne szycie, skóra najwyższej jakości, podeszwa antypoślizgowa.",
            price: 299,
            category: "shoes",
            images: JSON.stringify(["/images/products/product-1.jpg", "/images/products/product-2.jpg"]),
            sizes: JSON.stringify([38, 39, 40, 41, 42, 43]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Brązowy", hex: "#8B4513" }]),
          },
          {
            name: "Sneakersy Comfort",
            slug: "happy-boots-sneakersy-comfort",
            description: "Wygodne sneakersy na co dzień z amortyzującą podeszwą. Lekka konstrukcja, oddychający materiał, idealne na długie spacery.",
            price: 199,
            category: "shoes",
            images: JSON.stringify(["/images/products/product-3.jpg", "/images/products/product-4.jpg"]),
            sizes: JSON.stringify([36, 37, 38, 39, 40, 41, 42]),
            colors: JSON.stringify([{ name: "Biały", hex: "#f5f5f5" }, { name: "Szary", hex: "#9e9e9e" }, { name: "Granatowy", hex: "#1a237e" }]),
          },
          {
            name: "Szpilki Glamour",
            slug: "happy-boots-szpilki-glamour",
            description: "Eleganckie szpilki na obcasie 10 cm, idealne na wieczorne wyjścia. Stabilna konstrukcja, wkładka ze skóry naturalnej.",
            price: 249,
            category: "heels",
            images: JSON.stringify(["/images/products/product-5.jpg", "/images/products/product-6.jpg"]),
            sizes: JSON.stringify([35, 36, 37, 38, 39, 40]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Nude", hex: "#c8a882" }, { name: "Czerwony", hex: "#c62828" }]),
          },
          {
            name: "Botki Zimowe",
            slug: "happy-boots-botki-zimowe",
            description: "Ciepłe botki z futrzaną wyściółką, wodoodporne. Membrana Gore-Tex, podeszwa zimowa z bieżnikiem.",
            price: 349,
            category: "shoes",
            images: JSON.stringify(["/images/products/product-7.jpg", "/images/products/product-8.jpg"]),
            sizes: JSON.stringify([36, 37, 38, 39, 40, 41, 42]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Khaki", hex: "#827717" }]),
          },
        ],
      },
    },
  });

  // --- Medium Mentors (RR 25%) ---
  const mediumMentors = await prisma.seller.create({
    data: {
      name: "Medium Mentors",
      slug: "medium-mentors",
      description: "Stylowe bluzki i topy dla nowoczesnych kobiet",
      returnRate: 0.25,
      account: {
        create: {
          email: "medium.mentors@fashionhero.pl",
          passwordHash: await bcrypt.hash("MediumMentors2024!", 10),
        },
      },
      products: {
        create: [
          {
            name: "Bluzka Oversize",
            slug: "medium-mentors-bluzka-oversize",
            description: "Wygodna bluzka oversize z bawełny organicznej. 100% bawełna GOTS, pranie w 30°C, luźny krój pasujący na każdą sylwetkę.",
            price: 89,
            category: "tops",
            images: JSON.stringify(["/images/products/product-9.jpg", "/images/products/product-10.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
            colors: JSON.stringify([{ name: "Biały", hex: "#fafafa" }, { name: "Beżowy", hex: "#f5f0e8" }, { name: "Szary", hex: "#9e9e9e" }]),
          },
          {
            name: "Top Satynowy",
            slug: "medium-mentors-top-satynowy",
            description: "Elegancki top satynowy na ramiączkach, dostępny w wielu kolorach. Tkanina imitująca jedwab, regulowane ramiączka.",
            price: 129,
            category: "tops",
            images: JSON.stringify(["/images/products/product-11.jpg", "/images/products/product-12.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L"]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Burgund", hex: "#880e4f" }, { name: "Szampański", hex: "#f5e6c8" }]),
          },
          {
            name: "Bluzka w Kratę",
            slug: "medium-mentors-bluzka-w-krate",
            description: "Klasyczna bluzka w kratę z kołnierzykiem, casualowy styl. Bawełna z domieszką lnu, nie gniecie się.",
            price: 109,
            category: "tops",
            images: JSON.stringify(["/images/products/product-13.jpg", "/images/products/product-14.jpg"]),
            sizes: JSON.stringify(["S", "M", "L", "XL"]),
            colors: JSON.stringify([{ name: "Niebieska krata", hex: "#1565c0" }, { name: "Zielona krata", hex: "#2e7d32" }]),
          },
          {
            name: "Crop Top Premium",
            slug: "medium-mentors-crop-top-premium",
            description: "Modny crop top z wysokiej jakości dzianiny. Prążkowana struktura, elastyczny materiał, długość do pępka.",
            price: 79,
            category: "tops",
            images: JSON.stringify(["/images/products/product-15.jpg", "/images/products/product-16.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L"]),
            colors: JSON.stringify([{ name: "Biały", hex: "#fafafa" }, { name: "Czarny", hex: "#1a1a1a" }, { name: "Różowy", hex: "#f48fb1" }]),
          },
        ],
      },
    },
  });

  // --- Sad Penguins (RR 50%) ---
  const sadPenguins = await prisma.seller.create({
    data: {
      name: "Sad Penguins",
      slug: "sad-penguins",
      description: "Sukienki na każdą okazję — od codziennych po wieczorowe",
      returnRate: 0.50,
      account: {
        create: {
          email: "sad.penguins@fashionhero.pl",
          passwordHash: await bcrypt.hash("SadPenguins2024!", 10),
        },
      },
      products: {
        create: [
          {
            name: "Sukienka Midi Florals",
            slug: "sad-penguins-sukienka-midi-florals",
            description: "Romantyczna sukienka midi w kwiaty, idealna na lato. Przewiewna tkanina, elastyczna talia, zakrywa kolana.",
            price: 189,
            category: "dresses",
            images: JSON.stringify(["/images/products/product-17.jpg", "/images/products/product-18.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
            colors: JSON.stringify([{ name: "Kwiatowy błękit", hex: "#64b5f6" }, { name: "Kwiatowy róż", hex: "#f48fb1" }]),
          },
          {
            name: "Sukienka Koktajlowa",
            slug: "sad-penguins-sukienka-koktajlowa",
            description: "Elegancka sukienka koktajlowa na wyjątkowe wieczory. Tafta z połyskiem, gorsetowa góra, rozkloszowany dół.",
            price: 299,
            category: "dresses",
            images: JSON.stringify(["/images/products/product-19.jpg", "/images/products/product-20.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L"]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Granatowy", hex: "#1a237e" }, { name: "Bordowy", hex: "#880e4f" }]),
          },
          {
            name: "Sukienka Casual",
            slug: "sad-penguins-sukienka-casual",
            description: "Wygodna sukienka na co dzień z jerseyowej dzianiny. Elastyczny materiał, kieszonki po bokach, długość midi.",
            price: 139,
            category: "dresses",
            images: JSON.stringify(["/images/products/product-21.jpg", "/images/products/product-22.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Oliwkowy", hex: "#558b2f" }, { name: "Terakota", hex: "#bf360c" }]),
          },
          {
            name: "Maxi Sukienka Wieczorowa",
            slug: "sad-penguins-maxi-sukienka-wieczorowa",
            description: "Efektowna sukienka maxi z rozcięciem, stworzona na wielkie wyjścia. Gładka satyna, głęboki dekolt V, rozcięcie do uda.",
            price: 389,
            category: "dresses",
            images: JSON.stringify(["/images/products/product-23.jpg", "/images/products/product-24.jpg"]),
            sizes: JSON.stringify(["XS", "S", "M", "L"]),
            colors: JSON.stringify([{ name: "Czarny", hex: "#1a1a1a" }, { name: "Złoty", hex: "#f9a825" }, { name: "Głęboka czerwień", hex: "#b71c1c" }]),
          },
        ],
      },
    },
  });

  // Generuj dane sprzedażowe za 90 dni
  const happySales = generateSalesRecords(happyBoots.id, "great");
  const mediumSales = generateSalesRecords(mediumMentors.id, "medium");
  const sadSales = generateSalesRecords(sadPenguins.id, "poor");

  await prisma.salesRecord.createMany({ data: [...happySales, ...mediumSales, ...sadSales] });

  console.log("✅ Seed ukończony!");
  console.log("\n📋 Dane logowania do panelu sprzedawcy:");
  console.log("─".repeat(50));
  console.log(`👟 Happy Boots (RR 3% → prowizja 3%)`);
  console.log(`   Email:  happy.boots@fashionhero.pl`);
  console.log(`   Hasło:  HappyBoots2024!`);
  console.log("");
  console.log(`👕 Medium Mentors (RR 25% → prowizja 5%)`);
  console.log(`   Email:  medium.mentors@fashionhero.pl`);
  console.log(`   Hasło:  MediumMentors2024!`);
  console.log("");
  console.log(`🐧 Sad Penguins (RR 50% → ZABLOKOWANE)`);
  console.log(`   Email:  sad.penguins@fashionhero.pl`);
  console.log(`   Hasło:  SadPenguins2024!`);
  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
