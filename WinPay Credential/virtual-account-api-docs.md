# WinPay SNAP API - Virtual Account (VA) Documentation

Generated from: https://docs.winpay.id/docs/payments/snap-api/virtual-account
Date: November 17, 2025

## Overview

Akun Virtual (VA) adalah salah satu metode pembayaran yang disediakan oleh Winpay. VA dapat digunakan untuk melakukan pembayaran melalui mobile banking, internet banking, dan ATM.

## Jenis Akun Virtual

VA yang disediakan oleh Winpay terbagi menjadi 3 jenis, yaitu:

- **ONE OFF (c)** = VA yang hanya dapat digunakan untuk 1 kali pembayaran.
- **OPEN RECURRING (o)** = VA yang dapat digunakan untuk pembayaran berkala dan bersifat open payment (customer input nominal sendiri).
- **CLOSE RECURRING (r)** = VA yang dapat digunakan untuk pembayaran berkala dan bersifat close payment (customer tidak dapat input nominal sendiri).

## Metode Pembayaran Yang Didukung

Berikut adalah metode pembayaran yang didukung oleh masing-masing jenis VA:

| Bank      | Channel                | ONE OFF (c) | OPEN RECURRING (o) | CLOSE RECURRING (r) |
| --------- | ---------------------- | ----------- | ------------------ | ------------------- |
| BRI       | Bank Rakyat Indonesia  | ✅          | ✅                 | ✅                  |
| BNI       | Bank Negara Indonesia  | ✅          | ❌                 | ❌                  |
| MANDIRI   | Bank Mandiri           | ✅          | ❌                 | ❌                  |
| PERMATA   | Bank Permata           | ✅          | ✅                 | ✅                  |
| BSI       | Bank Syariah Indonesia | ✅          | ✅                 | ✅                  |
| MUAMALAT  | Bank Muamalat          | ✅          | ✅                 | ✅                  |
| BCA       | Bank Central ASIA      | ✅          | ✅                 | ✅                  |
| CIMB      | Bank CIMB NIAGA        | ✅          | ✅                 | ✅                  |
| SINARMAS  | Bank Sinarmas          | ✅          | ✅                 | ✅                  |
| BNC       | Bank Neo Commerce      | ✅          | ✅                 | ✅                  |
| INDOMARET | Indomaret              | ✅          | ❌                 | ❌                  |
| ALFAMART  | Alfamart               | ✅          | ❌                 | ❌                  |

## Transaksi Akun Virtual

### 1. Create VA

Service ini digunakan untuk membuat akun virtual (VA) baru.

#### Service Info

- **Service Code**: 27
- **HTTP Method**: POST
- **Path**: /v1.0/transfer-va/create-va

#### Payload Create VA

| Field                  | Type   | Required | Description                                                                                                                                                                                                                             |
| ---------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| customerNo             | String | C        | Nomor Virtual Account (if applicable). Wajib jika virtualAccountTrxType = o / r. Length: 3-14. Karakter yang Diizinkan: numeric. Jika virtualAccountTrxType = c dan nomor VA tidak tersedia, maka nomor VA akan di generate secara acak |
| virtualAccountName     | String | Y        | Nama Virtual Account. Length: 5-24. Karakter yang Diizinkan: huruf (a-z, A-Z), angka (0-9), garis bawah (\_), tanda hubung (-), dan spasi (\s)                                                                                          |
| trxId                  | String | Y        | Nomor transaksi. Length: 5-50. Karakter yang Diizinkan: huruf (a-z, A-Z), angka (0-9), garis bawah (\_) dan tanda hubung (-)                                                                                                            |
| totalAmount            | Object | C        | Total nominal transaksi. Wajib jika virtualAccountTrxType = c / r                                                                                                                                                                       |
| totalAmount.value      | String | Y        | Nilai transaksi. Length: 1-14. Karakter yang Diizinkan: numeric                                                                                                                                                                         |
| totalAmount.currency   | String | Y        | Kode mata uang. Length: 3. Allowed Value: IDR                                                                                                                                                                                           |
| virtualAccountTrxType  | String | Y        | Jenis transaksi VA. Allowed Value: c / o / r                                                                                                                                                                                            |
| expiredDate            | String | C        | Tanggal expired transaksi. Format: YYYY-MM-DDTHH:mm:ss+07:00. Wajib jika virtualAccountTrxType = c / r. Harus lebih dari 1 menit dan maksimal 3 bulan dari waktu request                                                                |
| additionalInfo         | Object | Y        | Informasi tambahan                                                                                                                                                                                                                      |
| additionalInfo.channel | String | Y        | Kode channel. Allowed Value: BRI / BNI / MANDIRI / PERMATA / BSI / MUAMALAT / BCA / CIMB / SINARMAS / BNC / INDOMARET / ALFAMART                                                                                                        |

#### Example Request

```json
{
  "customerNo": "000003212",
  "virtualAccountName": "Chus Pandi",
  "trxId": "INV-000000023212x2221",
  "totalAmount": {
    "value": "25000.00",
    "currency": "IDR"
  },
  "virtualAccountTrxType": "c",
  "expiredDate": "2023-09-05T19:30:14+07:00",
  "additionalInfo": {
    "channel": "CIMB"
  }
}
```

#### Response Create VA

| Field                                        | Type   | Description                                     |
| -------------------------------------------- | ------ | ----------------------------------------------- |
| responseCode                                 | String | Kode response                                   |
| responseMessage                              | String | Pesan response                                  |
| virtualAccountData                           | Object | Data VA yang telah dibuat                       |
| virtualAccountData.partnerServiceId          | String | Kode BIN dari bank                              |
| virtualAccountData.customerNo                | String | Nomor Customer                                  |
| virtualAccountData.virtualAccountNo          | String | Nomor Virtual Account                           |
| virtualAccountData.virtualAccountName        | String | Nama Virtual Account                            |
| virtualAccountData.trxId                     | String | Nomor transaksi merchant                        |
| virtualAccountData.totalAmount               | Object | Total nominal transaksi                         |
| virtualAccountData.totalAmount.value         | String | Nilai transaksi yang dibayar oleh customer      |
| virtualAccountData.totalAmount.currency      | String | Kode mata uang                                  |
| virtualAccountData.virtualAccountTrxType     | String | Jenis transaksi VA                              |
| virtualAccountData.expiredDate               | String | Tanggal expired transaksi                       |
| virtualAccountData.additionalInfo            | Object | Informasi tambahan                              |
| virtualAccountData.additionalInfo.channel    | String | Kode channel                                    |
| virtualAccountData.additionalInfo.contractId | String | Referensi transaksi yang dihasilkan oleh Winpay |

#### Example Response

```json
{
  "responseCode": "2002700",
  "responseMessage": "Success",
  "virtualAccountData": {
    "partnerServiceId": "   22691",
    "customerNo": "41693898987",
    "virtualAccountNo": "   2269141693898987",
    "virtualAccountName": "Chus Pandi",
    "trxId": "INV-000000023212x2221",
    "totalAmount": {
      "value": "25000.00",
      "currency": "IDR"
    },
    "virtualAccountTrxType": "c",
    "expiredDate": "2023-09-05T19:30:14+07:00",
    "additionalInfo": {
      "channel": "CIMB",
      "contractId": "cia80bff69-1073-4811-b1e1-13b738784d8b"
    }
  }
}
```

#### Response Codes Create VA

| Code    | Message                                   | Description                                            |
| ------- | ----------------------------------------- | ------------------------------------------------------ |
| 2002700 | Success                                   | -                                                      |
| 4002700 | Invalid response from biller              | Cek responseMessage untuk detail errornya              |
| 4002701 | Invalid field format { field name }       | -                                                      |
| 4002702 | Invalid mandatory field {field name}      | -                                                      |
| 4012700 | Invalid signature                         | X-Signature salah                                      |
| 4042716 | Partner tidak ada                         | X-Partner-ID tidak terdaftar                           |
| 4092700 | Cannot use same X-EXTERNAL-ID in same day | X-External-ID sudah pernah digunakan di hari yang sama |
| 4092701 | Duplicate trxId                           | trxId sudah pernah digunakan                           |

### 2. Inquiry VA

Service ini digunakan untuk mengecek status virtual akun aktif / tidak.

#### Service Info

- **Service Code**: 30
- **HTTP Method**: GET
- **Path**: /v1.0/transfer-va/inquiry-va

#### Payload Inquiry VA

| Field                     | Type   | Required | Description                                                                                                                  |
| ------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| trxId                     | String | Y        | Nomor transaksi. Length: 5-50. Karakter yang Diizinkan: huruf (a-z, A-Z), angka (0-9), garis bawah (\_) dan tanda hubung (-) |
| additionalInfo            | Object | Y        | Informasi tambahan                                                                                                           |
| additionalInfo.contractId | String | Y        | contractId dari create VA                                                                                                    |

#### Example Request

```json
{
  "trxId": "INV-000000023212x22",
  "additionalInfo": {
    "contractId": "ci302a21c9-bb4b-40c5-880d-e99691ed0af9"
  }
}
```

#### Response Inquiry VA

| Field                                        | Type   | Description                                     |
| -------------------------------------------- | ------ | ----------------------------------------------- |
| responseCode                                 | String | Kode response                                   |
| responseMessage                              | String | Pesan response                                  |
| virtualAccountData                           | Object | Data VA yang telah dibuat                       |
| virtualAccountData.partnerServiceId          | String | Kode BIN dari bank                              |
| virtualAccountData.customerNo                | String | Nomor Customer                                  |
| virtualAccountData.virtualAccountNo          | String | Nomor Virtual Account                           |
| virtualAccountData.virtualAccountName        | String | Nama Virtual Account                            |
| virtualAccountData.trxId                     | String | Nomor transaksi merchant                        |
| virtualAccountData.totalAmount               | Object | Total nominal transaksi                         |
| virtualAccountData.totalAmount.value         | String | Nilai transaksi yang dibayar oleh customer      |
| virtualAccountData.totalAmount.currency      | String | Kode mata uang                                  |
| virtualAccountData.virtualAccountTrxType     | String | Jenis transaksi VA                              |
| virtualAccountData.expiredDate               | String | Tanggal expired transaksi                       |
| virtualAccountData.additionalInfo            | Object | Informasi tambahan                              |
| virtualAccountData.additionalInfo.channel    | String | Kode channel                                    |
| virtualAccountData.additionalInfo.contractId | String | Referensi transaksi yang dihasilkan oleh Winpay |

#### Example Response

```json
{
  "responseCode": "2003000",
  "responseMessage": "Success",
  "virtualAccountData": {
    "virtualAccountNo": "2269186000003212",
    "virtualAccountName": "Mas Nchus",
    "trxId": "INV-000000023212x22",
    "totalAmount": {
      "value": "25000.00",
      "currency": "IDR"
    },
    "expiredDate": "2023-09-01T19:30:14+00:00",
    "additionalInfo": {
      "channel": "CIMB",
      "contractId": "ci302a21c9-bb4b-40c5-880d-e99691ed0af9"
    }
  }
}
```

#### Response Codes Inquiry VA

| Code    | Message                                   | Description                                            |
| ------- | ----------------------------------------- | ------------------------------------------------------ |
| 2003000 | Success                                   | -                                                      |
| 4003000 | Invalid response from biller              | Cek responseMessage untuk detail errornya              |
| 4003001 | Invalid field format { field name }       | -                                                      |
| 4003002 | Invalid mandatory field {field name}      | -                                                      |
| 4013000 | Invalid signature                         | X-Signature salah                                      |
| 4043001 | Transaction tidak ada                     | trxId dan contractId tidak ditemukan                   |
| 4043016 | Partner tidak ada                         | X-Partner-ID tidak terdaftar                           |
| 4093000 | Cannot use same X-EXTERNAL-ID in same day | X-External-ID sudah pernah digunakan di hari yang sama |
| 4093001 | Duplicate trxId                           | trxId sudah pernah digunakan                           |
| 5003002 | reqbill tidak ada                         | contractId tidak ditemukan                             |

### 3. Inquiry Status

Layanan ini digunakan untuk memeriksa status transaksi virtual akun.

#### Service Info

- **Service Code**: 26
- **HTTP Method**: GET
- **Path**: /v1.0/transfer-va/status

#### Payload Inquiry Status

| Field                     | Type   | Required | Description                                                                                                               |
| ------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| virtualAccountNo          | String | Y        | Nomor Virtual Akun                                                                                                        |
| trxId                     | String | Y        | Id Transaksi. Length: 5-50. Karakter yang Diizinkan: huruf (a-z, A-Z), angka (0-9), garis bawah (\_) dan tanda hubung (-) |
| additionalInfo            | Object | Y        | Informasi tambahan                                                                                                        |
| additionalInfo.contractId | String | Y        | contractId from create VA                                                                                                 |

#### Example Request

```json
{
  "virtualAccountNo": "   2269141708949044",
  "additionalInfo": {
    "contractId": "ciaf1b982a-9d06-4e27-ba39-a6aefd9e813d",
    "channel": "CIMB",
    "trxId": "xxxxxxxxxxx13"
  }
}
```

#### Response Inquiry Status

| Field                                        | Type   | Description                                              |
| -------------------------------------------- | ------ | -------------------------------------------------------- |
| responseCode                                 | String | Kode Respon                                              |
| responseMessage                              | String | Pesan Respon                                             |
| virtualAccountData                           | Object | Data VA yang telah dibuat                                |
| virtualAccountData.virtualAccountNo          | String | Nomor Virtual Akun                                       |
| virtualAccountData.virtualAccountName        | String | Nama Virtual Akun                                        |
| virtualAccountData.paymentFlagStatus         | String | Status Transaksi VA (00 - paid, 01 - unpaid, 02 - check) |
| virtualAccountData.transactionDate           | String | Tanggal Transaksi                                        |
| virtualAccountData.referenceNo               | String | Nomor referensi pembayaran                               |
| virtualAccountData.totalAmount               | Object | Total jumlah transaksi                                   |
| virtualAccountData.totalAmount.value         | String | Nilai transaksi yang dibayarkan oleh pelanggan           |
| virtualAccountData.totalAmount.currency      | String | Kode mata uang                                           |
| virtualAccountData.additionalInfo            | Object | Informasi tambahan                                       |
| virtualAccountData.additionalInfo.channel    | String | Kode Chanel                                              |
| virtualAccountData.additionalInfo.contractId | String | Referensi transaksi yang dihasilkan oleh Winpay          |
| virtualAccountData.additionalInfo.trxId      | String | Nomor transaksi merchant                                 |

#### Example Response

```json
{
  "responseCode": "2002600",
  "responseMessage": "Successful",
  "virtualAccountData": {
    "virtualAccountNo": "2269141708949044",
    "virtualAccountName": "Valid 14",
    "paymentFlagStatus": "00",
    "transactionDate": "2024-02-26T19:04:51+00:00",
    "referenceNo": "50966",
    "totalAmount": {
      "value": "15000.00",
      "currency": "IDR"
    }
  },
  "additionalInfo": {
    "contractId": "ciaf1b982a-9d06-4e27-ba39-a6aefd9e813d",
    "channel": "CIMB",
    "trxId": "xxxxxxxxxxx13"
  }
}
```

#### Response Codes Inquiry Status

| Code    | Message                                   | Description                                       |
| ------- | ----------------------------------------- | ------------------------------------------------- |
| 2002600 | Success                                   | -                                                 |
| 4002600 | Invalid response from biller              | Cek responseMessage untuk detail error            |
| 4002601 | Invalid field format { field name }       | -                                                 |
| 4002602 | Invalid mandatory field {field name}      | -                                                 |
| 4012600 | Invalid signature                         | X-Signature salah                                 |
| 4042601 | Transaction tidak ada                     | trxId dan contractId tidak ada                    |
| 4042616 | Partner tidak ada                         | X-Partner-ID tidak terdaftar                      |
| 4092600 | Cannot use same X-EXTERNAL-ID in same day | X-External-ID sudah digunakan pada hari yang sama |
| 4092601 | Duplicate trxId                           | trxId sudah digunakan pada hari yang sama         |
| 5002602 | reqbill tidak ada                         | contractId tidak ada                              |

### 4. Delete VA

Layanan ini digunakan untuk membatalkan virtual account dengan status unpaid.

#### Service Info

- **Service Code**: 31
- **HTTP Method**: DELETE
- **Path**: /v1.0/transfer-va/delete-va

#### Payload Delete VA

| Field                     | Type   | Required | Description                                                                                                               |
| ------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| virtualAccountNo          | String | Y        | Nomor Virtual Akun                                                                                                        |
| trxId                     | String | Y        | Id Transaksi. Length: 5-50. Karakter yang Diizinkan: huruf (a-z, A-Z), angka (0-9), garis bawah (\_) dan tanda hubung (-) |
| additionalInfo            | Object | Y        | Informasi tambahan                                                                                                        |
| additionalInfo.contractId | String | Y        | contractId dari create VA                                                                                                 |
| additionalInfo.channel    | String | -        | Kode channel                                                                                                              |

#### Example Request

```json
{
  "virtualAccountNo": "   2269131710748503",
  "trxId": "XINV-000000170104",
  "additionalInfo": {
    "contractId": "ci067a0336-4ddf-4001-9cef-3eb107c331f4",
    "channel": "CIMB"
  }
}
```

#### Response Delete VA

| Field                     | Type   | Description                                     |
| ------------------------- | ------ | ----------------------------------------------- |
| responseCode              | String | Kode Respon                                     |
| responseMessage           | String | Pesan Respon                                    |
| virtualAccountData        | Object | Data VA yang telah dibuat                       |
| virtualAccountData.trxId  | String | Nomor transaksi merchant                        |
| additionalInfo            | Object | Informasi tambahan                              |
| additionalInfo.contractId | String | Referensi transaksi yang dihasilkan oleh Winpay |
| additionalInfo.channel    | String | Kode Channel                                    |

#### Example Response

```json
{
  "responseCode": "2003100",
  "responseMessage": "Success",
  "virtualAccountData": {
    "trxId": "xxxxxxxxxxx20"
  },
  "additionalInfo": {
    "contractId": "si4390d6cb-5e9f-41fb-bfa3-51f6e7c9e4b4",
    "channel": "BSI"
  }
}
```

#### Response Codes Delete VA

| Code    | Message                                   | Description                                       |
| ------- | ----------------------------------------- | ------------------------------------------------- |
| 2003100 | Success                                   | -                                                 |
| 4003100 | Invalid response from biller              | cek responseMessage untuk detail error            |
| 4003101 | Invalid field format { field name }       | -                                                 |
| 4003102 | Invalid mandatory field {field name}      | -                                                 |
| 4013100 | Invalid signature                         | X-Signature salah                                 |
| 4043101 | Transaction tidak ada                     | trxId dan contractId tidak ada                    |
| 4043116 | Partner tidak ada                         | X-Partner-ID tidak terdaftar                      |
| 4093100 | Cannot use same X-EXTERNAL-ID in same day | X-External-ID telah digunakan pada hari yang sama |
| 4093101 | Duplicate trxId                           | trxId sudah pernah digunakan                      |
| 5003102 | reqbill tidak ada                         | contractId tidak ada                              |

## Handle Payment Callback

Setelah customer melakukan pembayaran, Winpay akan mengirimkan callback ke merchant untuk memberitahukan status pembayaran. Merchant harus mengimplementasikan service untuk menerima callback dari Winpay.

Kami akan mengirimkan callback ke merchant 3x sampai merchant meresponse dengan response yang diharapkan. Namun ketika percobaan callback pertama sudah sesuai maka kami tidak akan mengirimkan callback lagi.

### Callback Info

- **Service Code**: 25
- **HTTP Method**: POST
- **Path**: {{yoururl}}/v1.0/transfer-va/payment

### Struktur Header

| Header        | Value                     | Description    |
| ------------- | ------------------------- | -------------- |
| Content-Type  | application/json          | -              |
| X-Timestamp   | 2023-08-24T17:07:05+07:00 | ISO8601 String |
| X-Partner-ID  | {partnerId}               | -              |
| X-Signature   | {signature}               | -              |
| X-External-ID | {externalId}              | -              |
| Channel-ID    | {channelId}               | -              |

### Callback Payload

| Field                     | Type   | Description                                     |
| ------------------------- | ------ | ----------------------------------------------- |
| partnerServiceId          | String | Kode BIN dari bank                              |
| customerNo                | String | Nomor Customer                                  |
| virtualAccountNo          | String | Nomor Virtual Account                           |
| virtualAccountName        | String | Nama Virtual Account                            |
| trxId                     | String | Nomor transaksi merchant                        |
| paymentRequestId          | String | Nomor transaksi pembayaran                      |
| paidAmount                | Object | Total nominal transaksi                         |
| paidAmount.value          | String | Nilai transaksi yang dibayar oleh customer      |
| paidAmount.currency       | String | Kode mata uang                                  |
| trxDateTime               | String | Tanggal transaksi                               |
| referenceNo               | String | Nomor referensi pembayaran                      |
| additionalInfo            | Object | Informasi tambahan                              |
| additionalInfo.channel    | String | Kode channel                                    |
| additionalInfo.contractId | String | Referensi transaksi yang dihasilkan oleh Winpay |

#### Example Callback Payload

```json
{
  "partnerServiceId": "   22691",
  "customerNo": "41693903614",
  "virtualAccountNo": "   2269141693903614",
  "virtualAccountName": "Bayar 2269141693903614",
  "trxId": "INV-000000023212x2224",
  "paymentRequestId": "88889123",
  "paidAmount": {
    "value": "10000",
    "currency": "IDR"
  },
  "trxDateTime": "2023-09-05T22:47:00+07:00",
  "referenceNo": "36238",
  "additionalInfo": {
    "channel": "CIMB",
    "contractId": "ci71a51730-2373-455f-b538-3f9912fefb73"
  }
}
```

### Expected Response

Response yang diharapkan dari merchant adalah sebagai berikut:

```json
{
  "responseCode": "2002500",
  "responseMessage": "Successful"
}
```

## Authentication Headers

All API requests require the following headers:

| Header        | Description             | Example                              |
| ------------- | ----------------------- | ------------------------------------ |
| X-Timestamp   | ISO8601 timestamp       | 2023-08-24T17:07:05+07:00            |
| X-Partner-ID  | Your merchant ID        | fe515458-df5e-4ab6-9136-84b18e79f1e8 |
| X-Signature   | RSA-SHA256 signature    | base64-encoded-signature             |
| X-External-ID | Unique request ID       | VA-1695106274000                     |
| Content-Type  | Always application/json | application/json                     |
| Channel-ID    | Channel identifier      | SNAP                                 |

## Signature Generation

```
stringToSign = HTTPMethod + ":" + EndpointUrl + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + TimeStamp
signature = base64_encode(SHA256withRSA(private_key, stringToSign))
```

## Payment Status Codes

| Code | Status | Description                       |
| ---- | ------ | --------------------------------- |
| 00   | Paid   | Payment successful                |
| 01   | Unpaid | Payment not yet made              |
| 02   | Check  | Payment status needs verification |

## Error Response Format

```json
{
  "responseCode": "ERROR_CODE",
  "responseMessage": "Error description"
}
```

## Production URLs

- **Base URL**: https://snap.winpay.id
- **Create VA**: POST /v1.0/transfer-va/create-va
- **Inquiry VA**: GET /v1.0/transfer-va/inquiry-va
- **Inquiry Status**: GET /v1.0/transfer-va/status
- **Delete VA**: DELETE /v1.0/transfer-va/delete-va
- **Callback**: POST {{yoururl}}/v1.0/transfer-va/payment

---

_Generated from WinPay SNAP API Documentation - Virtual Account_
_Source: https://docs.winpay.id/docs/payments/snap-api/virtual-account_
_Date: November 17, 2025_</content>
<parameter name="filePath">c:\Users\kevin\SynologyDrive\project25 (senjagames.id)\senjagamesid\WinPay Credential\virtual-account-api-docs.md
