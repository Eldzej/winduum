const SELECTOR = '.lib-dialog[data-type="dynamic"]'

const dialogSelector = selector =>
    typeof selector === 'string'
    ? document.querySelectorAll(selector)[document.querySelectorAll(selector).length - 1] ?? null
    : selector

const removeDialog = async (selector = SELECTOR) => {
    await Promise.allSettled(dialogSelector(selector).getAnimations().map(animation => animation.finished))
    dialogSelector(selector).remove()
}

const showDialog = async (options = {}) => {
    options = Object.assign({ content: null, selector: SELECTOR, remove: false, append: false }, options)

    return new Promise(resolve => {
        if (!options.append && options.content) {
            dialogSelector(options.selector)?.firstElementChild?.remove()
        }

        if (!dialogSelector(options.selector) || options.append || (options.selector && !options.content)) {
            options.content &&
                document.body.insertAdjacentHTML('beforeend', '<dialog class="lib-dialog" data-type="dynamic"></dialog>')

            if (!dialogSelector(options.selector)._dialogHasEvents) {
                dialogSelector(options.selector)._dialogHasEvents = true
                
                dialogSelector(options.selector).addEventListener('keydown', async ({ key }) => {
                    if (key === 'Escape') {
                        dialogSelector(options.selector).setAttribute('inert', '')

                        options.remove && setTimeout(removeDialog, 1)
                    }
                })

                dialogSelector(options.selector).addEventListener('mousedown', ({ target }) => {
                    if (target.nodeName === 'DIALOG') {
                        hideDialog(options)
                    }
                })
            }
        }

        dialogSelector(options.selector).removeAttribute('inert')

        options.content &&
            dialogSelector(options.selector).insertAdjacentHTML('beforeend', options.content)

        window.HTMLDialogElement
            ? dialogSelector(options.selector).showModal()
            : dialogSelector(options.selector).setAttribute('open', '')

        document.documentElement.style.setProperty('--lib-dialog-offset-r', `${window.innerWidth - document.body.clientWidth}px`)

        resolve()
    })
}

const hideDialog = async (options = {}) => {
    console.log(options)

    options = Object.assign({ selector: SELECTOR, remove: true }, options)

    return new Promise(async resolve => {
        window.HTMLDialogElement
            ? dialogSelector(options.selector).close()
            : dialogSelector(options.selector).removeAttribute('open')

        dialogSelector(options.selector).setAttribute('inert', '')
        options.remove && await removeDialog()

        resolve()
    })
}

const fetchDialog = async ({ url }) => {
    fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(({ dialog }) => showDialog(dialog))
}

export { showDialog, hideDialog, fetchDialog }
