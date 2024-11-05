<template>
	<div class="popbox">
		<div class="popboxContent">
			<slot />
			<button @click="closePopbox">OK</button>
		</div>
	</div>
</template>

<script setup>
const emit = defineEmits(["close"]);

function closePopbox() {
	emit("close");
}
</script>

<style scoped>
.popbox {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	justify-content: center;
	align-items: center;
}

.popboxContent {
	font-size: 14px;
	min-width: 15%;
	min-height: 20%;
	background-color: white;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
	border-radius: 25px;
	padding: 10px;
	text-align: center;
	animation: fadeIn 0.5s ease;
}

button {
	font-size: 18px;
	font-weight: bold;
	text-decoration: none;
	color: black;
	border-radius: 25px;
	border: 2px solid black;
	cursor: pointer;
	margin-top: 8px;
	padding: 10px 15px;
	background-color: transparent;
	transition: background-color 0.5s, color 0.5s;
}

button:hover {
	background-color: black;
	color: white;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>