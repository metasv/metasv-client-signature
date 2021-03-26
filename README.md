# MetaSV Client Signature Request demo

本项目是一个简单的示例，展示如何使用money button提供的bsv库来进行客户端签名，用来安全地从客户端访问MetaSV接口。

一般来说，访问MetaSV接口使用MetaSV提供的JsonWebToken（JWT）来进行认证就足够了。JWT认证适用与服务器与MetaSV接口通信的场景下，JWT不能泄漏。

但是在客户端直连MetaSV访问的场景下，考虑到密钥可能被浏览器截取，有暴露key的风险，因此不能直接使用JWT来访问MetaSV。需要使用密钥对签名的方式来进行认证。

## 前置准备

首先需要应用方自行生成比特币密钥对，包括公钥和私钥。注意，此密钥对只用来访问MetaSV鉴权，不要使用此密钥参与任何比特币交易。记录公钥，私钥。

在MetaSV平台上，使用JWT调用ClientKey注册接口，来注册ClientPublicKey（一个账号可以创建不超过5个ClientPublicKey）。只需要注册比特币公钥，私钥应用方自己保留，MetaSV不保存任何用户私钥。ClientPublicKey的格式是Hex十六进制表示的比特币公钥。

MetaSV将使用用户已注册的可信ClientPublicKey来进行request签名校验，如果签名正确，就可以替代JWT来调取MetaSV接口。

## 签名方式和签名算法

### Http请求头

为了防止伪造攻击以及重放攻击，客户端请求需要提供发送请求的timestamp，以及一个随机数nonce。timestamp用于保证请求构造出来之后，5分钟内立刻发送到MetaSV服务器，超时的请求不予接受。nonce用于保证同一个请求MetaSV只接受一次，防止重放攻击。

客户端请求必须携带以下4个http header：

1. MetaSV-Timestamp: 1616746489806
2. MetaSV-Client-Pubkey: 02fd17dd0c52e54e5eed4ebe1e75df5e48df422f81c26520d44380bef1691fdd98
3. MetaSV-Nonce: 8990516823
4. MetaSV-Signature: MEUCIQD+OBaXv5B+QGfc6J6yZWmA/QWmegRbsX5qHfGNcam+9gIgWQCcmp0zT2eLqrGqpB2POEu8Af4uasu/z7BodZgGbJM=

MetaSV-Timestamp 构造请求时的毫秒级unix时间戳

MetaSV-Client-Pubkey 构造请求使用的客户端ClientPublicKey，就是之前注册过的比特币公钥

MetaSV-Nonce: 随机十位数，尽量保证nonce随机，相同的nonce每10分钟只能使用一次

MetaSV-Signature: 使用ClientPublicKey对应的私钥进行签名

### 签名算法

MetaSV使用与比特币交易相同的Ecdsa（椭圆曲线数字签名算法）算法来进行签名。

首先组装签名用的消息体，将请求url中的path（path不包括query参数部分），请求头中的Timestamp和Nonce使用字符"_"进行拼接：

```javascript

// 结果类似下面的字符串
// /block/000000000000000007dded8e2a733c654a006520409cdb0d6cdf642a1328c330_1616746489806_8990516823
const message = path + '_' + timestamp + '_' + nonce

```

然后对message进行sha256哈希运算

```javascript
const hash = bsv.Hash.sha256(Buffer.from(message))
```

对hash运算的结果，使用Ecdsa签名，并对签名结果进行base64编码

```javascript
const sig = bsv.Ecdsa.sign(hash, keyPair)
// 类似如下的字符串
// MEUCIQD+OBaXv5B+QGfc6J6yZWmA/QWmegRbsX5qHfGNcam+9gIgWQCcmp0zT2eLqrGqpB2POEu8Af4uasu/z7BodZgGbJM=
const sigEncoded = sig.toBuffer().toString("base64")
```

然后在请求头的MetaSV-Signature字段里，加入sigEncoded，就可以完成客户端鉴权。

## 本地测试运行示例 

```shell

git clone git@github.com:metasv/metasv-client-signature.git

cd metasv-client-signature

npm install

node index.js

```
