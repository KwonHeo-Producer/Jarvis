$(document).ready(function () {
    $('pre').each(function (index, e) {
        let button = document.createElement('button');
        button.innerText = "Copy";
        button.className = 'copy-button';
        button.style.cursor = 'pointer';
        button.setAttribute('data-clipboard-text', e.innerText);
        button.addEventListener('mouseleave', function(event) {
            event.currentTarget.setAttribute('class', 'copy-button');
            event.currentTarget.removeAttribute('copy-message');
        });
        e.appendChild(button);
    });
 
    var clipboard = new ClipboardJS('.copy-button');
    clipboard.on('success', function (e) {
        e.clearSelection();
        e.trigger.setAttribute('class', 'copy-button copy-message');
        e.trigger.setAttribute('copy-message', 'Copied!');
 
        setTimeout(() => {
			$('.copy-button').removeClass('copy-message');
        }, 500);
    });
});
