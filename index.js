const bsv = require('bsv')
const axios = require('axios')

// todo replace this private key with your own
const privateKey = bsv.PrivKey.fromWif("Kwew44uvemMGsQS8qH2Xi3MBarDjqBNfV4Mn5Sa424ey3NFKzsJM")
const publicKey = bsv.PubKey.fromPrivKey(privateKey)
const keyPair = new bsv.KeyPair(privateKey, publicKey)

// prepare request
const domain = "https://apiv2.metasv.com"
const path = "/xpubs"
const timestamp = Date.now()
const nonce = Math.random().toString().substr(2, 10);
const message = path + '_' + timestamp + '_' + nonce
console.log("Message: " + message)
console.log("Pubkey: " + publicKey.toHex())

// generate signature
const hash = bsv.Hash.sha256(Buffer.from(message))
const sig = bsv.Ecdsa.sign(hash, keyPair)
const sigEncoded = sig.toBuffer().toString("base64")
console.log("Signature: " + sigEncoded)

// verify the signature is valid
console.log("Valid: " + bsv.Ecdsa.verify(hash, bsv.Sig.fromBuffer(Buffer.from(sigEncoded, "base64")), publicKey))

// print send request
axios.interceptors.request.use(request => {
    console.log('Request: ', JSON.stringify(request, null, 2))
    return request
})

// print response
axios.get(domain + path, {
    headers: {
        'MetaSV-Timestamp': timestamp,
        'MetaSV-Client-Pubkey': publicKey.toHex(),
        'MetaSV-Nonce': nonce,
        'MetaSV-Signature': sigEncoded
    }
}).then((response => {
    console.log('Response: ', response.data);
}))

