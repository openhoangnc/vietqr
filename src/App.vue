<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { makeVietQRContent } from '../libs/vietqr';

import banks from './banks.json'

const amount = ref()
const description = ref('')
const bankId = ref('')
const accountId = ref('')


watch(bankId, () => {
  window.localStorage.setItem('bankId', bankId.value)
})

watch(accountId, () => {
  window.localStorage.setItem('accountId', accountId.value)
})

watch(amount, () => {
  window.localStorage.setItem('amount', amount.value.toString())
})

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
    amount.value = parseInt(amountFromStorage)
  }

  const contentFromStorage = window.localStorage.getItem('content')
  if (contentFromStorage) {
    description.value = contentFromStorage
  }
})

const qrContent = computed(() => makeVietQRContent({
  bankId: bankId.value,
  accountId: accountId.value,
  amount: amount.value,
  description: description.value.trim(),
}))

</script>

<template>
  <main>
    <div class="inputs">
      <div style="text-align: left;">
        <p>
          <a href="https://github.com/openhoangnc/vietqr">VietQR generator - mã nguồn mở phát triển bởi openhoangnc</a>
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
        <input maxlength="13" type="number" v-model="amount" placeholder="Tùy chọn, tối đa 13 số" />
      </div>
      <div>
        <span>Nội dung</span>
        <input maxlength="25" type="text" v-model="description" placeholder="Tùy chọn, tối đa 25 chữ không dấu" />
      </div>
    </div>

    <div class="output">
      <textarea class="output-text" readonly>{{ qrContent }}</textarea>
      <img class="qr" :src="`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${qrContent}`" alt="QR" />
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 500px;
}

.bank-select {
  width: 380px;
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
}

.output-text {
  width: 100%;
}

.qr {
  width: 100%;
  padding: 1.5em;
  filter: brightness(120%);
  filter: contrast(120%);
}
</style>
