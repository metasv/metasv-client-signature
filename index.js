const bsv = require('bsv')

const privateKey = bsv.PrivKey.fromWif("Kwew44uvemMGsQS8qH2Xi3MBarDjqBNfV4Mn5Sa424ey3NFKzsJM")
const publicKey = bsv.PubKey.fromPrivKey(privateKey)
const keyPair = new bsv.KeyPair(privateKey, publicKey)
const path = "/block/000000000000000007dded8e2a733c654a006520409cdb0d6cdf642a1328c330"
const timestamp = Date.now()
const nonce = Math.random().toString().substr(2, 10);
const message = path + '_' + timestamp + '_' + nonce
console.log(message)
console.log(privateKey.toWif())
console.log(publicKey.toHex())

const hash = bsv.Hash.sha256(Buffer.from(message))
const sig = bsv.Ecdsa.sign(hash, keyPair)
const sigEncoded = sig.toBuffer().toString("base64")
console.log(sigEncoded)

console.log(bsv.Ecdsa.verify(hash, bsv.Sig.fromBuffer(Buffer.from(sigEncoded, "base64")), publicKey))

