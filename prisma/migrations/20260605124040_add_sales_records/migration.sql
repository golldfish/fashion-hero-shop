-- CreateTable
CREATE TABLE "SalesRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "unitsSold" INTEGER NOT NULL,
    "revenue" REAL NOT NULL,
    "returns" INTEGER NOT NULL,
    "sellerId" TEXT NOT NULL,
    CONSTRAINT "SalesRecord_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
