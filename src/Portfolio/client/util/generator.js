for (let i = 1; i <= 10; i++) {
    console.log(`
        Layout.uint64(amountAsset${i}), //8
        Layout.publicKey(addressAsset${i}), //32
        Layout.uint64(periodAsset${i}), //2
        Layout.publicKey(assetToSoldIntoAsset${i}), //32
    `)

}