<script setup>
import { onMounted, ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import VuePincodeInput from 'vue3-pincode-input';
import { ElMessage } from 'element-plus'


const greetMsg = ref("");
const name = ref("");
const code = ref(localStorage.getItem("QuickPastePincode")||"");


async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  console.log()
  greetMsg.value = await invoke("greet", { name: name.value });
  
}

async function setPincode() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  if (code.value.length !== 4) {
    ElMessage({
      message: 'Pincode length error',
      type: 'error',
    })
    return
  }

  // console.log(code.value)
  await invoke("set_pincode", { code: code.value });
  ElMessage({
    message: 'Clipboard Sharing.',
    type: 'success',
  })
}

onMounted(()=>{
  
})

</script>

<template>
  <div class="row">
    <p>Same PIN code clients share the clipboard</p>

    <div class="input-containner">
      <VuePincodeInput
        v-model="code"
        autofocus
      />
    </div>
    <p></p>
    <el-button @click="setPincode" :disabled="code.length!==4">start</el-button>
  </div>
  <div class="row">
    
  </div>

  <p>{{ greetMsg }}</p>
</template>

<style scoped>
.input-containner{

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    border-radius: 0.5rem;
}
</style>