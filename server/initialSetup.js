const { User } = require('./models/models')
const bcrypt = require('bcrypt')

async function createFirstAdmin() {
    try {
        const adminExists = await User.findOne({ where: { role: 'admin' } })
        if (!adminExists) {
            const email = process.env.ADMIN_EMAIL || 'anne@email.com'
            const password = process.env.ADMIN_PASSWORD || 'admin123'
            
            await User.create({
                email,
                password: await bcrypt.hash(password, 5),
                role: 'admin',
                first_name: 'Анна',
                last_name: 'Нелюбина',
                middle_name: 'Анатольевна'
            })
            console.log('[Initial Setup] First admin created')
        }
    } catch (error) {
        console.error('[Initial Setup] Admin creation error:', error)
        throw error // Пробрасываем ошибку дальше
    }
}

module.exports = createFirstAdmin