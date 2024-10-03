import { toastNotifications } from '../main';

export function	createToast(type = 'successful', message = 'undefined') {
	if (toastNotifications) {
		toastNotifications.innerHTML = '';
	}
	const icon = type === 'warning' ? '<i class="fa-solid fa-circle-exclamation fa-xl"></i>' : '<i class="fa-solid fa-circle-check fa-xl"></i>';
	toastNotifications.innerHTML = /* html */`
		<div class="toast-container position-fixed bottom-0 end-0 p-3">
			<div id="liveToast" class="toast toast-${type}" role="alert" aria-live="assertive" aria-atomic="true">
				<div class="toast-header">
						<strong class="me-auto mb-1 mt-1 d-flex justify-content-center align-items-center gap-2">
							${icon} 
							<p class="fs-6">${message}</p>
						</strong>
					<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
				</div>
			</div>
		</div>
	`;
	const toast = new bootstrap.Toast(document.getElementById('liveToast'));
	toast.show();
}