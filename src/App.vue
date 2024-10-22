<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { makeVietQRContent } from '../libs/vietqr';
import banks from './banks.json'
import domtoimage from 'dom-to-image';
import QRCode from "qrcode-svg";

const amount = ref()
const description = ref('')
const bankId = ref('')
const accountId = ref('')

const selectedBank = computed(() => banks.find(bank => bank.bin === bankId.value))

watch(bankId, () => {
  window.localStorage.setItem('bankId', bankId.value)
})

watch(accountId, () => {
  window.localStorage.setItem('accountId', accountId.value)
})

let debouncingStorage: number = 0

const updateAmount = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (debouncingStorage) {
    clearTimeout(debouncingStorage)
  }

  setTimeout(() => {
    // remove leading zero
    let v = target.value.toString().replace(/^0+/, '')
    
    // remove any non-digit character
    v = v.replace(/\D/g, '')

    // insert comma every 3 digits
    v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    amount.value = v

    window.localStorage.setItem('amount', v)
  }, 100)
}

watch(description, () => {
  window.localStorage.setItem('content', description.value)
})

onMounted(() => {
  const bankIdFromStorage = window.localStorage.getItem('bankId')
  if (bankIdFromStorage) {
    bankId.value = bankIdFromStorage
  }

  const accountIdFromStorage = window.localStorage.getItem('accountId')
  if (accountIdFromStorage) {
    accountId.value = accountIdFromStorage
  }

  const amountFromStorage = window.localStorage.getItem('amount')
  if (amountFromStorage) {
    amount.value = amountFromStorage
  }

  const contentFromStorage = window.localStorage.getItem('content')
  if (contentFromStorage) {
    description.value = contentFromStorage
  }
})

const qrContent = computed(() => makeVietQRContent({
  bankId: bankId.value,
  accountId: accountId.value,
  amount: parseInt(amount.value?.replace(/\D/g, '')),
  description: description.value.trim(),
}))

const qrSVG = computed(() => {
  const qr = new QRCode({
    content: qrContent.value,
    padding: 5,
    width: 300,
    height: 300,
    color: "#000000",
    background: "#ffffff",
    ecl: "M"
  });
  return qr.svg()
})

const copyText = ref('Copy mã QR')

const qrNode = ref<HTMLDivElement>()
function dataURLtoBlob(dataURL: string) {
  // Split the data URL into two parts: the header and the data
  var parts = dataURL.split(',');
  var mimeType = parts[0].match(/:(.*?);/)?.[1]; // Extract the MIME type from the header

  // Decode the base64-encoded data
  var base64Data = atob(parts[1]);

  // Create a Uint8Array from the raw binary data
  var arrayBuffer = new ArrayBuffer(base64Data.length);
  var uint8Array = new Uint8Array(arrayBuffer);
  for (var i = 0; i < base64Data.length; i++) {
    uint8Array[i] = base64Data.charCodeAt(i);
  }

  // Create a Blob object with the MIME type
  return new Blob([uint8Array], { type: mimeType });
}

const copyImage = () => {

  if (!qrNode.value) {
    return
  }

  domtoimage.toPng(qrNode.value)
    .then(function (dataUrl: string) {
      navigator.clipboard.write([
        new ClipboardItem({
          ['image/png']: dataURLtoBlob(dataUrl)
        })
      ])
        .then(() => {
          copyText.value = 'Đã copy'
          setTimeout(() => {
            copyText.value = 'Copy mã QR'
          }, 2000);
        })
        .catch((error) => {
          alert('Copy failed: ' + error)
        });
    })
    .catch(function (error: any) {
      console.error('oops, something went wrong!', error);
    });


}
</script>

<template>
  <main>
    <div class="inputs">
      <div style="text-align: left;">
        <p>
          <a target="_blank" href="https://github.com/openhoangnc/vietqr">VietQR generator <br>mã nguồn mở phát triển bởi
            openhoangnc</a>
        </p>
      </div>
      <div>
        <span>Ngân hàng</span>
        <select v-model="bankId" class="bank-select">
          <option v-for="bank in banks" :value="bank.bin">
            {{ bank.shortName + ' - ' + bank.code + ' - ' + bank.name }}
          </option>
        </select>
      </div>
      <div>
        <span>Số tài khoản</span>
        <input maxlength="25" type="text" v-model="accountId" />
      </div>
      <div>
        <span>Số tiền</span>
        <input maxlength="16" type="text" v-model="amount" @input="updateAmount($event)" placeholder="Tùy chọn, tối đa 13 số" />
      </div>
      <div>
        <span>Nội dung</span>
        <input maxlength="25" type="text" v-model="description" placeholder="Tùy chọn, tối đa 25 chữ không dấu" />
      </div>
    </div>

    <div class="output">
      <button class="copy-btn" @click="copyImage">{{ copyText }}</button>

      <div class="qr-overlay" ref="qrNode">
        <span class="qr-text-top" v-if="selectedBank && accountId">{{ selectedBank?.shortName }} - {{ accountId }}</span>
        <div v-html="qrSVG" class="qr-image"></div>
        <span class="qr-text-bottom">afixer.app/vietqr</span>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  padding: 30px;
}

.bank-select {
  width: 280px;
  height: 30px;
}

.inputs {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.inputs>div {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 10px;
}

.inputs>div>span {
  width: 100px;
  margin-right: 20px;
  text-align: left;
}

.inputs input {
  flex: 1;
  height: 24px;
}

.output {
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.output-text {
  width: 100%;
}

.qr-overlay {
  display: block;
  position: relative;
}

.qr-text-top {
  position: absolute;
  top: 1px;
  left: 50%;
  transform: translateX(-50%);
  color: #000;
  white-space: nowrap;
}

.qr-text-bottom {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  color: #000;
  white-space: nowrap;
}

.qr-image {
  width: 100%;
  image-rendering: pixelated;
}

.copy-btn {
  width: 150px;
  height: 40px;
  font-size: large;
  border: 1px solid #aeaeae5b;
  border-radius: 5px;
  cursor: pointer;
}

.copy-btn:hover {
  box-shadow: 0 0 20px #00ff66c8;
}
</style>
