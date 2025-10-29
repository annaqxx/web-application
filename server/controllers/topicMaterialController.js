const {Discipline, GroupDiscipline, Group, StudyMaterial, Topic} = require('../models/models')
const ApiError = require('../error/ApiError')

class topicMaterialController {
    async createMaterial(req, res, next) {
        try {
            const { id_group, id_discipline, id_topic, content, resource_type } = req.body;
            const teacher_id = req.user.id;

            if (!id_group || !id_discipline || !id_topic || !resource_type) {
                return next(ApiError.badRequest('Не все обязательные поля заполнены'));
            }
            
            // Для файлов проверяем наличие загруженного файла
            let filePath = '';
            if (resource_type === 'pdf' || resource_type === 'document') {
                if (!req.files || !req.files.file) {
                    return next(ApiError.badRequest('Файл не загружен'));
                }
                
                const file = req.files.file;
                const fileName = uuid.v4() + path.extname(file.name);
                const uploadPath = path.join(__dirname, '..', 'static', fileName);
                
                await file.mv(uploadPath);
                filePath = fileName;
            }

            const material = await StudyMaterial.create({
                teacher_id,
                id_group,
                id_discipline,
                id_topic,
                content: resource_type === 'pdf' || resource_type === 'document' ? filePath : content,
                resource_type
            });
            
            return res.json(material);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getAllMaterials(req, res, next) {
        try {
            const materials = await StudyMaterial.findAll({
                include: [
                    { model: Topic, attributes: ['name'] },
                    { model: Discipline, attributes: ['name'] },
                    { model: Group, attributes: ['name'] }
                ]
            })
            return res.json(materials)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
    
    async getMaterialsByGroup(req, res, next) {
        try {
            const { groupId } = req.params;
            const materials = await StudyMaterial.findAll({
                where: { id_group: groupId },
                include: [
                    { model: Topic, attributes: ['name'] },
                    { model: Discipline, attributes: ['name'] }
                ]
            });
            return res.json(materials);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
    
    async getMaterialsByDiscipline(req, res, next) {
        try {
            const { disciplineId } = req.params
            const materials = await StudyMaterial.findAll({
                where: { id_discipline: disciplineId },
                include: [
                    { model: Topic, attributes: ['name'] },
                    { model: Group, attributes: ['name'] }
                ]
            })
            return res.json(materials)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
    
    async getMaterialsByTopic(req, res, next) {
        try {
            const { topicId } = req.params
            const materials = await StudyMaterial.findAll({
                where: { id_topic: topicId },
                include: [
                    { model: Discipline, attributes: ['name'] },
                    { model: Group, attributes: ['name'] }
                ]
            })
            return res.json(materials)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async updateMaterial(req, res, next) {
        try {
            const { id } = req.params
            const { content, resource_type } = req.body
            
            const material = await StudyMaterial.findOne({ where: { id } })
            if (!material) {
                return next(ApiError.notFound('Материал не найден'))
            }

            if (material.teacher_id !== req.user.id) {
                return next(ApiError.forbidden('Нет прав на редактирование'))
            }

            await material.update({ content, resource_type })
            return res.json(material)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async deleteMaterial(req, res, next) {
        try {
            const { id } = req.params
            
            const material = await StudyMaterial.findOne({ where: { id } })
            if (!material) {
                return next(ApiError.notFound('Материал не найден'))
            }

            if (material.teacher_id !== req.user.id) {
                return next(ApiError.forbidden('Нет прав на удаление'))
            }

            await material.destroy()
            return res.json({ message: 'Материал успешно удален' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // ========== Темы ==========
    async createTopic(req, res, next) {
    try {
        const { name } = req.body; // Убрали id_discipline
        if (!name) {
        return next(ApiError.badRequest('Не указано название темы'));
        }
    
        const topic = await Topic.create({ name }); // Создаем тему только с именем
        return res.json(topic);
    } catch (e) {
        return next(ApiError.internal(e.message));
    }
    }

    async getAllTopics(req, res, next) {
        try {
            const topics = await Topic.findAll(); // Убрали include Discipline
            return res.json(topics);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async updateTopic(req, res, next) {
    try {
        const { id } = req.params;
        const { name } = req.body; // Убрали id_discipline
        
        if (!name) {
        return next(ApiError.badRequest('Не указано название темы'));
        }
        
        const topic = await Topic.findOne({ where: { id } });
        if (!topic) {
        return next(ApiError.notFound('Тема не найдена'));
        }

        await topic.update({ name }); // Обновляем только имя
        return res.json(topic);
    } catch (e) {
        return next(ApiError.internal(e.message));
    }
    }

    async deleteTopic(req, res, next) {
    try {
        const { id } = req.params;
        
        const topic = await Topic.findOne({ where: { id } });
        if (!topic) {
        return next(ApiError.notFound('Тема не найдена'));
        }
        
        // Проверка, что нет материалов, связанных с этой темой
        const materialsCount = await StudyMaterial.count({
        where: { id_topic: id }
        });
        
        if (materialsCount > 0) {
        return next(ApiError.badRequest('Нельзя удалить тему, так как с ней связаны материалы'));
        }
        
        await topic.destroy();
        return res.json({ message: 'Тема успешно удалена' });
    } catch (e) {
        return next(ApiError.internal(e.message));
    }
    }

    // ========== Дисциплины ==========
    async createDiscipline(req, res, next) {
        try {
            const { name } = req.body;
            if (!name) {
                return next(ApiError.badRequest('Не указано название дисциплины'));
            }
        
            const discipline = await Discipline.create({ name });
            return res.json(discipline);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async getAllDisciplines(req, res, next) {
        try {
            const disciplines = await Discipline.findAll();
            return res.json(disciplines);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }
    
    async getDisciplinesByGroup(req, res, next) {
        try {
            const { groupId } = req.params;
            
            if (!groupId) {
                return next(ApiError.badRequest('Не указан ID группы'));
            }

            const disciplines = await Discipline.findAll({
                include: [{
                    model: Group,
                    where: { id: groupId },
                    through: { attributes: [] }
                }]
            });

            if (!disciplines || disciplines.length === 0) {
                return next(ApiError.notFound('Для этой группы не найдено дисциплин'));
            }

            return res.json(disciplines);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async updateDiscipline(req, res, next) {
        try {
            const { id } = req.params
            const { name } = req.body
            
            if (!name) {
                return next(ApiError.badRequest('Не указано название дисциплины'))
            }
            
            const discipline = await Discipline.findOne({ where: { id } })
            if (!discipline) {
                return next(ApiError.notFound('Дисциплина не найдена'))
            }

            await discipline.update({ name })
            return res.json(discipline)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
    
    async deleteDiscipline(req, res, next) {
        try {
            const { id } = req.params
            
            const discipline = await Discipline.findOne({ where: { id } })
            if (!discipline) {
                return next(ApiError.notFound('Дисциплина не найдена'))
            }
            
            // Проверка, что нет материалов, связанных с этой дисциплиной
            const materialsCount = await StudyMaterial.count({
                where: { id_discipline: id }
            })
            
            if (materialsCount > 0) {
                return next(ApiError.badRequest('Нельзя удалить дисциплину, так как с ней связаны материалы'))
            }
            
            await discipline.destroy()
            return res.json({ message: 'Дисциплина успешно удалена' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
    
    // ========== Связи групп и дисциплин ==========
    async addDisciplineToGroup(req, res, next) {
        try {
            const { id_group, id_discipline } = req.body
            
            if (!id_group || !id_discipline) {
                return next(ApiError.badRequest('Не указаны ID группы или дисциплины'))
            }
            
            const existingLink = await GroupDiscipline.findOne({
                where: { id_group: id_group, id_discipline: id_discipline }
            })
            
            if (existingLink) {
                return next(ApiError.badRequest('Дисциплина уже привязана к этой группе'))
            }
            
            const link = await GroupDiscipline.create({
                id_group: id_group,
                id_discipline: id_discipline
            })
            
            return res.json(link)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
    
    async removeDisciplineFromGroup(req, res, next) {
        try {
            const { id_group, id_discipline } = req.body
            
            if (!id_group || !id_discipline) {
                return next(ApiError.badRequest('Не указаны ID группы или дисциплины'))
            }
            
            const link = await GroupDiscipline.findOne({
                where: { id_group: id_group, id_discipline: id_discipline }
            })
            
            if (!link) {
                return next(ApiError.notFound('Связь не найдена'))
            }
            
            // Проверка, что нет материалов, связанных с этой связью
            const materialsCount = await StudyMaterial.count({
                where: { id_group: id_group, id_discipline: id_discipline }
            })
            
            if (materialsCount > 0) {
                return next(ApiError.badRequest('Нельзя удалить связь, так как с ней связаны материалы'))
            }
            
            await link.destroy()
            return res.json({ message: 'Связь успешно удалена' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getTopicsByDiscipline(req, res, next) {
        try {
            const { disciplineId } = req.params;
            
            // Находим все материалы для данной дисциплины
            const materials = await StudyMaterial.findAll({
            where: { id_discipline: disciplineId },
            include: [
                { 
                model: Topic,
                attributes: ['id', 'name'],
                required: true
                }
            ],
            attributes: [],
            group: ['Topic.id', 'Topic.name'],
            raw: true
            });

            // Извлекаем уникальные темы
            const topics = materials.map(m => ({
            id: m['Topic.id'],
            name: m['Topic.name']
            }));

            return res.json(topics);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

}

module.exports = new topicMaterialController()