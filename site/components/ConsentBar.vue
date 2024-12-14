<template>
	<div class="consentBar">
		<div class="consentBarContent">
			<slot />
			<div class="consentBarButtons">
				<button @click="consent(true)">Jdeme na to</button>
				<button @click="consent(false)">Odmítnout</button>
			</div>
		</div>
	</div>
</template>

<script setup>
const emit = defineEmits(["consent"]);

function consent(consent) {
	emit("consent", consent);
}
</script>

<style scoped>
.consentBar {
	position: fixed;
	width: 97.2%;
	bottom: 0;
	z-index: 99;
	background-color: white;
	color: black;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2);
	border-top-left-radius: 20px;
	border-top-right-radius: 20px;
	margin-left: 1%;
	margin-right: 1%;
}

.consentBarContent {
	padding: 21px;
	text-align: left;
	font-size: 14px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.consentBarButtons {
	margin-top: 10px;
	display: flex;
	gap: 10px;
}

.consentBarButtons button {
	font-size: 16px;
	font-weight: bold;
	text-decoration: none;
	color: var(--textColor);
	border-radius: 25px;
	border: 2px solid var(--textColor);
	cursor: pointer;
	padding: 10px 15px;
	background-color: transparent;
	transition: background-color 0.5s, color 0.5s;
}

.consentBarButtons button:hover {
	background-color: black;
	color: white;
}

@media (max-width: 800px) {
	.consentBarContent {
		flex-direction: column;
	}

	.consentBar {
		margin-left: 0;
		margin-right: 0;
		width: 100%;
	}
}

@media (min-width: 1025px) and (max-width: 1279px) {
	.consentBarContent {
		flex-direction: column;
	}

	.consentBar {
		margin-left: 0;
		margin-right: 0;
		width: 100%;
	}
}
</style>
