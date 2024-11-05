<template>
	<div :class="['popup', { pop }]">
		<slot />
	</div>
</template>

<script setup>
import { ref } from "vue";

const pop = ref(false);

function show() {
	pop.value = true;
	setTimeout(() => {
		pop.value = false;
	}, 3000);
}

defineExpose({ show });
</script>

<style scoped>
.popup {
	position: fixed;
	z-index: 2;
	bottom: -7%;
	left: 50%;
	transform: translateX(-50%);
	padding: 1px 15px;
	background-color: white;
	box-shadow: 0 2px 20px rgba(0, 0, 0, 0.7);
	border-radius: 25px;
	transition: bottom 1s ease;
	font-weight: bold;
	font-size: 13px;
	text-align: center;
	text-transform: uppercase;
	min-width: 15%;
}

.popup.pop {
	bottom: 20px;
}
</style>