# DOKU SNAP Payment Integration Guide

> **Author:** Dozer
> **Date:** 2026-09-17


---

## Table of Contents
- [Overview](#overview)
- [Authentication & Token](#authentication--token)
- [Virtual Account Payment](#virtual-account-payment)
- [Direct Debit / E-Wallet Payment](#direct-debit--e-wallet-payment)
- [Signature Validation](#signature-validation)
- [Notification Handling](#notification-handling)
- [Response Codes](#response-codes)
- [Implementation Checklist](#implementation-checklist)

---

## Overview

### Apa itu SNAP?

SNAP (Sistem Nasional Pemrosesan Pembayaran) adalah gateway pembayaran di DOKU yang mendukung dua metode utama:

1. **Virtual Account (VA)** – Transfer bank ke nomor virtual yang di-generate
2. **Direct Debit** – Debet langsung dari e-wallet (OVO, DANA) atau rekening bank

### Endpoints

| Environment | URL |
|---|---|
| Sandbox | `https://api-sandbox.doku.com` |
| Production | `https://api.doku.com` |

### Alur Umum Integrasi SNAP

```
1. Get Token API
   ↓
2. Create Payment (VA/Direct Debit)
   ↓
3. Display Payment Info ke Customer
   ↓
4. Terima Notification dari DOKU
   ↓
5. Verify Signature & Proses Notification
   ↓
6. Return Response 200 ke DOKU
```

---

## Authentication & Token

### 1. Get B2B Token API

**Endpoint:** `POST /authorization/v1/access-token/b2b`

**Service Code:** 73

**Tujuan:** Mendapatkan access token untuk API calls selanjutnya

#### Request Headers

```
X-SIGNATURE: SHA256withRSA(privateKey, stringToSign)
             stringToSign = clientId + "|" + X-TIMESTAMP
X-TIMESTAMP: 2024-09-17T14:30:00+07:00
X-CLIENT-KEY: MCH-0008-1296507211683
Content-Type: application/json
```

#### Request Body

```json
{
  "grantType": "client_credentials"
}
```

#### Response (Success - HTTP 200)

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "refreshToken": "refresh_token_value"
}
```

**Token TTL:** Default 3600 detik (1 jam)

#### Implementasi (Node.js Example)

```javascript
const crypto = require('crypto');

async function getB2BToken(clientId, privateKey, clientSecret) {
  const timestamp = new Date().toISOString();
  
  // Create signature: SHA256withRSA
  const stringToSign = `${clientId}|${timestamp}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(stringToSign)
    .sign(privateKey, 'base64');

  const response = await fetch('https://api-sandbox.doku.com/authorization/v1/access-token/b2b', {
    method: 'POST',
    headers: {
      'X-SIGNATURE': signature,
      'X-TIMESTAMP': timestamp,
      'X-CLIENT-KEY': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ grantType: 'client_credentials' })
  });

  const data = await response.json();
  return data.accessToken;
}
```

---

## Virtual Account Payment

### Flow: DOKU Generate Payment Code (DGPC)

**Cocok untuk:** E-commerce, checkout online

#### 1. Create Virtual Account

**Endpoint:** `POST /virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va`

**Service Code:** 27

#### Request Headers

```
X-TIMESTAMP: 2024-09-17T14:30:00+07:00
X-SIGNATURE: HMAC-SHA512(clientSecret, stringToSign)
X-PARTNER-ID: MCH-0008-1296507211683
X-EXTERNAL-ID: 20240917001
CHANNEL-ID: H2H
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

```json
{
  "partnerServiceId": "   95962",
  "customerNo": "CUST20240917001",
  "virtualAccountNo": null,
  "virtualAccountName": "PT. Dozer Technology",
  "virtualAccountEmail": "billing@dntech.id",
  "virtualAccountPhone": "6285712345678",
  "trxId": "TRX20240917001",
  "totalAmount": {
    "value": "500000.00",
    "currency": "IDR"
  },
  "expiredDate": "2024-09-18T14:30:00+07:00",
  "virtualAccountTrxType": "C",
  "additionalInfo": {
    "channel": "VIRTUAL_ACCOUNT_BTN",
    "trxId": "INV-20240917-001"
  }
}
```

**Penjelasan Parameter:**
- `partnerServiceId`: Service ID (8 digit, left-padded dengan space)
- `customerNo`: Customer ID Anda (max 20 digit)
- `virtualAccountName`: Nama customer
- `totalAmount`: Nominal pembayaran. Untuk open amount, set ke `0.00`
- `virtualAccountTrxType`: 
  - `C` = Closed Amount (fixed)
  - `O` = Open Amount (customer bisa input jumlah)
  - `V` = Bill Variable
- `expiredDate`: Kapan VA expired

#### Response (Success - HTTP 200)

```json
{
  "responseCode": "2000700",
  "responseMessage": "Success",
  "virtualAccountData": {
    "partnerServiceId": "   95962",
    "customerNo": "CUST20240917001",
    "virtualAccountNo": "950620240917001",
    "virtualAccountName": "PT. Dozer Technology",
    "virtualAccountEmail": "billing@dntech.id",
    "totalAmount": {
      "value": "500000.00",
      "currency": "IDR"
    },
    "virtualAccountTrxType": "C",
    "expiredDate": "2024-09-18T14:30:00+07:00"
  },
  "additionalInfo": {
    "channel": "VIRTUAL_ACCOUNT_BTN",
    "howToPayPage": "https://doku.com/payment-instruction/950620240917001",
    "howToPayApi": "https://api.doku.com/payment-instruction/950620240917001"
  }
}
```

**Langkah berikutnya:**
1. Display `virtualAccountNo` ke customer: `950620240917001`
2. Simpan data di database Anda (status: PENDING)
3. Tunggu notification pembayaran dari DOKU

#### Implementasi (Node.js)

```javascript
const crypto = require('crypto');

function generateSignature(clientSecret, method, path, timestamp, body, accessToken) {
  const hashBody = crypto.createHash('sha256').update(body || '').digest('hex');
  
  const stringToSign = `${method}:${path}:${accessToken}:${hashBody}:${timestamp}`;
  
  return crypto
    .createHmac('sha512', clientSecret)
    .update(stringToSign)
    .digest('hex');
}

async function createVirtualAccount(config, vaData) {
  const timestamp = new Date().toISOString();
  const path = '/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va';
  const body = JSON.stringify(vaData);
  
  const signature = generateSignature(
    config.clientSecret,
    'POST',
    path,
    timestamp,
    body,
    config.accessToken
  );

  const response = await fetch(`https://api-sandbox.doku.com${path}`, {
    method: 'POST',
    headers: {
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': config.clientId,
      'X-EXTERNAL-ID': vaData.trxId,
      'CHANNEL-ID': 'H2H',
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    },
    body
  });

  return await response.json();
}

// Usage
const result = await createVirtualAccount(config, {
  partnerServiceId: '   95962',
  customerNo: 'CUST20240917001',
  virtualAccountName: 'Customer Name',
  totalAmount: { value: '500000.00', currency: 'IDR' },
  expiredDate: '2024-09-18T14:30:00+07:00',
  trxId: 'TRX20240917001',
  virtualAccountTrxType: 'C',
  additionalInfo: { channel: 'VIRTUAL_ACCOUNT_BTN' }
});

console.log(result.virtualAccountData.virtualAccountNo); // 950620240917001
```

### 2. Terima Payment Notification

DOKU akan POST ke `Notification URL` Anda ketika customer melakukan transfer.

#### Notification Payload

```json
{
  "partnerServiceId": "   95962",
  "customerNo": "CUST20240917001",
  "virtualAccountNo": "950620240917001",
  "virtualAccountName": "PT. Dozer Technology",
  "trxId": "INV-20240917-001",
  "paymentRequestId": "20240917001",
  "paidAmount": {
    "value": "500000.00",
    "currency": "IDR"
  },
  "paidDatetime": "2024-09-17T15:45:30+07:00",
  "virtualAccountTrxType": "C",
  "additionalInfo": {
    "channel": "VIRTUAL_ACCOUNT_BTN"
  }
}
```

#### Response Yang Harus Anda Kirim

```json
{
  "responseCode": "2005600",
  "responseMessage": "Success",
  "approvalCode": "123456"
}
```

### 3. Implementasi Notification Handler

```javascript
const crypto = require('crypto');

async function handlePaymentNotification(req, clientSecret) {
  // 1. Verify Signature
  const {
    'x-signature': signature,
    'x-timestamp': timestamp,
    'x-partner-id': partnerId,
    'x-external-id': externalId,
    authorization: authHeader
  } = req.headers;

  const body = JSON.stringify(req.body);
  const accessToken = authHeader.replace('Bearer ', '');
  
  const expectedSignature = crypto
    .createHmac('sha512', clientSecret)
    .update(`POST:/v1.1/transfer-va/payment:${accessToken}:${crypto.createHash('sha256').update(body).digest('hex')}:${timestamp}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({
      responseCode: '4010001',
      responseMessage: 'Invalid Signature'
    });
  }

  // 2. Process Payment
  const { paidAmount, virtualAccountNo, trxId } = req.body;
  
  try {
    // Update database
    await db.update('orders', {
      order_id: trxId,
      status: 'PAID',
      amount_paid: paidAmount.value,
      paid_at: new Date()
    });

    // Return success
    return res.status(200).json({
      responseCode: '2005600',
      responseMessage: 'Success',
      approvalCode: Date.now().toString()
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      responseCode: '5000000',
      responseMessage: 'Internal Server Error'
    });
  }
}
```

---

## Direct Debit / E-Wallet Payment

### Payment Methods Support

- **OVO** (SNAP) – One-Time & Recurring
- **DANA** (SNAP)
- **BRI Direct Debit** (Tokenization)
- **CIMB Direct Debit** (Tokenization)
- **Allo Bank Direct Debit** (Tokenization)

### Flow: OVO Payment Example

#### 1. Account Binding

Sebelum payment, customer harus binding akun OVO mereka.

**Endpoint:** `POST /direct-debit/core/v1/registration-account-binding`

**Service Code:** Lihat dokumentasi DOKU

#### Request Headers

```
X-TIMESTAMP: 2024-09-17T14:30:00+07:00
X-SIGNATURE: HMAC-SHA512(clientSecret, stringToSign)
X-PARTNER-ID: MCH-0008-1296507211683
X-EXTERNAL-ID: BINDING-20240917-001
Authorization: Bearer {accessToken}
Content-Type: application/json
```

#### Request Body

```json
{
  "partnerCustomerId": "CUST20240917001",
  "channelId": "OVO_SNAP",
  "phoneNumber": "6285712345678",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "additionalInfo": {
    "channel": "OVO_SNAP"
  }
}
```

#### Response

```json
{
  "responseCode": "2000700",
  "responseMessage": "Success",
  "bindingData": {
    "tokenId": "token_abc123xyz",
    "bindingStatus": "PENDING",
    "channelId": "OVO_SNAP"
  },
  "authenticationUrl": "https://doku.com/otp-verify/session-123"
}
```

**Langkah berikutnya:** Redirect customer ke `authenticationUrl` untuk input OTP.

#### 2. Balance Inquiry

Setelah binding, cek saldo customer untuk memastikan ada dana.

**Endpoint:** `POST /direct-debit/core/v1/balance-inquiry`

#### Request

```json
{
  "channelId": "OVO_SNAP",
  "partnerCustomerId": "CUST20240917001",
  "tokenId": "token_abc123xyz",
  "additionalInfo": {
    "channel": "OVO_SNAP"
  }
}
```

#### Response

```json
{
  "responseCode": "2000700",
  "responseMessage": "Success",
  "balanceData": {
    "balance": "2500000.00",
    "currency": "IDR"
  }
}
```

#### 3. Payment

**Endpoint:** `POST /direct-debit/core/v1/debit/payment-host-to-host`

#### Request

```json
{
  "channelId": "OVO_SNAP",
  "partnerReferenceNo": "TRX20240917001",
  "partnerCustomerId": "CUST20240917001",
  "tokenId": "token_abc123xyz",
  "transactionAmount": {
    "value": "500000.00",
    "currency": "IDR"
  },
  "paymentType": "SALE",
  "transactionDate": "2024-09-17",
  "merchantId": "MCH-0008-1296507211683",
  "terminalId": "TERM001",
  "pointOfInitiation": "DIRECT_API",
  "additionalInfo": {
    "channel": "OVO_SNAP",
    "merchantCategoryCode": "5411"
  }
}
```

**Parameter:** 
- `paymentType: "SALE"` = One-time payment (need OTP)
- `paymentType: "RECURRING"` = Recurring (no OTP on each transaction)

#### Response

```json
{
  "responseCode": "2000700",
  "responseMessage": "Success",
  "debitData": {
    "transactionId": "2024091700001",
    "partnerReferenceNo": "TRX20240917001",
    "transactionStatus": "PENDING",
    "transactionAmount": {
      "value": "500000.00",
      "currency": "IDR"
    }
  },
  "webRedirectUrl": "https://doku.com/otp-verify/payment-session-456"
}
```

**Untuk paymentType SALE:** Redirect ke `webRedirectUrl` untuk OTP verification.

**Untuk paymentType RECURRING:** Langsung charge, customer dapat notification dari OVO.

---

## Signature Validation

### HMAC-SHA512 Signature

Digunakan untuk request dan response validation.

#### Request Signature Generation

```
stringToSign = METHOD:PATH:BEARER_TOKEN:HEX(SHA256(BODY)):TIMESTAMP

Contoh:
POST:/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va:eyJhbGci...:a3b2c1d4...:2024-09-17T14:30:00+07:00

signature = HMAC-SHA512(clientSecret, stringToSign)
```

#### Implementasi

```javascript
const crypto = require('crypto');

function generateRequestSignature(method, path, accessToken, body, timestamp, clientSecret) {
  // 1. Hash body dengan SHA256
  const bodyHash = crypto
    .createHash('sha256')
    .update(body || '')
    .digest('hex');

  // 2. Create stringToSign
  const stringToSign = `${method}:${path}:${accessToken}:${bodyHash}:${timestamp}`;

  // 3. Create HMAC-SHA512
  const signature = crypto
    .createHmac('sha512', clientSecret)
    .update(stringToSign)
    .digest('hex');

  return signature;
}

// Test
const sig = generateRequestSignature(
  'POST',
  '/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va',
  'eyJhbGciOiJSUzI1NiJ9...',
  '{"partnerServiceId":"   95962"...}',
  '2024-09-17T14:30:00+07:00',
  'your_client_secret_key'
);

console.log(sig); // abc123...
```

#### Response Signature Verification (Notification)

```javascript
function verifyNotificationSignature(headers, body, clientSecret) {
  const {
    'x-signature': receivedSignature,
    'x-timestamp': timestamp,
    'authorization': authHeader
  } = headers;

  const accessToken = authHeader.replace('Bearer ', '');
  const bodyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('hex');

  const stringToSign = `POST:/v1.1/transfer-va/payment:${accessToken}:${bodyHash}:${timestamp}`;

  const expectedSignature = crypto
    .createHmac('sha512', clientSecret)
    .update(stringToSign)
    .digest('hex');

  return receivedSignature === expectedSignature;
}
```

---

## Notification Handling

### Setup Notification URL

1. Tambahkan Notification URL di DOKU Dashboard
2. Format: `https://yourdomain.com/webhook/doku-payment`
3. HTTPS required (tidak boleh HTTP)
4. Response time < 30 detik

### Retry Mechanism

DOKU akan retry jika response bukan HTTP 200:
- Retry 1: 1 menit
- Retry 2: 5 menit
- Retry 3: 30 menit
- Retry 4: 1 jam
- Retry 5-10: Per jam

### Notification Status Codes

| Code | Status | Keterangan |
|---|---|---|
| 00 | SUCCESS | Pembayaran berhasil |
| 03 | PENDING | Menunggu konfirmasi |
| 04 | REFUNDED | Sudah di-refund |
| 05 | CANCELED | Dibatalkan |
| 06 | FAILED | Gagal |

### Idempotency

DOKU mengirim `X-EXTERNAL-ID` untuk setiap notification. Gunakan ini untuk prevent duplicate processing:

```javascript
async function handleNotification(req) {
  const externalId = req.headers['x-external-id'];
  
  // Check if sudah diproses
  const existing = await db.findOne('notifications', { external_id: externalId });
  if (existing) {
    return res.status(200).json({ responseCode: '2005600' });
  }

  // Process & save
  // ...

  await db.insert('notifications', { external_id: externalId, processed_at: new Date() });
  return res.status(200).json({ responseCode: '2005600' });
}
```

---

## Response Codes

### Format: HTTP_CODE + SERVICE_CODE + CASE_CODE (7 digit)

**Contoh:** `2000700` = HTTP 200 + Service 07 + Case 00

### Virtual Account Response Codes

| Code | Meaning |
|---|---|
| 2000700 | Success |
| 4000701 | Invalid merchant |
| 4000702 | Invalid partner |
| 4000703 | Invalid request format |
| 4000704 | Duplicate virtual account |
| 4000705 | Virtual account not found |
| 5000700 | Internal server error |

### Direct Debit Response Codes

| Code | Meaning |
|---|---|
| 2000700 | Success |
| 4000701 | Invalid token/binding |
| 4000702 | Insufficient balance |
| 4000703 | Transaction declined |
| 4000704 | OTP verification failed |
| 5000700 | Server error |

---

## Implementation Checklist

### Pre-Integration

- [ ] Register ke DOKU Dashboard & dapatkan credentials
- [ ] Dapatkan `clientId`, `clientSecret`, `privateKey`
- [ ] Setup Notification URL (HTTPS only)
- [ ] Test di sandbox dulu

### Backend Implementation

- [ ] Implement Get B2B Token API
- [ ] Implement HMAC-SHA512 signature generation & verification
- [ ] Implement Create VA / Payment endpoint
- [ ] Implement Notification Handler
  - [ ] Verify signature
  - [ ] Verify idempotency (X-EXTERNAL-ID)
  - [ ] Update order status di database
  - [ ] Return HTTP 200

### API Testing

```bash
# Test get token
curl -X POST https://api-sandbox.doku.com/authorization/v1/access-token/b2b \
  -H "X-SIGNATURE: ..." \
  -H "X-TIMESTAMP: 2024-09-17T14:30:00+07:00" \
  -H "X-CLIENT-KEY: MCH-..." \
  -H "Content-Type: application/json" \
  -d '{"grantType":"client_credentials"}'

# Test create VA
curl -X POST https://api-sandbox.doku.com/virtual-accounts/bi-snap-va/v1.1/transfer-va/create-va \
  -H "X-SIGNATURE: ..." \
  -H "X-TIMESTAMP: 2024-09-17T14:30:00+07:00" \
  -H "X-PARTNER-ID: MCH-..." \
  -H "X-EXTERNAL-ID: 20240917001" \
  -H "CHANNEL-ID: H2H" \
  -H "Authorization: Bearer ..." \
  -H "Content-Type: application/json" \
  -d '{"partnerServiceId":"   95962",...}'
```

### Production Deployment

- [ ] Switch endpoints ke production (`api.doku.com`)
- [ ] Update credentials ke production keys
- [ ] Test end-to-end dengan nominal kecil
- [ ] Monitor notification delivery
- [ ] Setup alerts untuk failed payments

### Security

- [ ] Simpan `clientSecret` di environment variable, jangan hardcode
- [ ] Validate semua signatures sebelum proses
- [ ] Log semua transactions (untuk audit trail)
- [ ] Rate limit notification endpoint
- [ ] Use HTTPS untuk webhook

---

## Reference Links

- DOKU API Docs: https://developers.doku.com/
- Virtual Account: https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/virtual-account
- Direct Debit: https://developers.doku.com/accept-payments/direct-api/snap/integration-guide/direct-debit
- Notification: https://developers.doku.com/get-started-with-doku-api/notification/http-notification-sample-for-snap
- Response Codes: https://developers.doku.com/get-started-with-doku-api/response-code/http-status-and-case-code

---

**Last Updated:** September 2024
**Version:** 1.0
