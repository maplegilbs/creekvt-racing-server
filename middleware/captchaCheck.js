async function captchaCheck(req, res, next) {
    console.log(req.body)
    try {
        let { recaptchaValue } = req.body
        if (!recaptchaValue) { res.status(403).json({ message: `Recaptcha Not Completed` }) }
        const recaptchaCheckResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaValue}`, { method: "POST" })
        const recaptchaCheckJSON = await recaptchaCheckResponse.json();
        if (recaptchaCheckJSON.success) next()
        else {
            throw new Error(`Recaptcha Check from https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaValue} failed`)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: `Error with recaptcha` })
    }
}

module.exports = { captchaCheck }