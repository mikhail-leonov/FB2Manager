-- =========================
-- GENRES
-- =========================

-- Business & Economics
INSERT INTO Genres (genre_id, title) VALUES ('economics_ref', 'Деловая литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('popular_business', 'Карьера, кадры') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('org_behavior', 'Маркетинг, PR') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('banking', 'Финансы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('economics', 'Экономика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Detectives & Thrillers
INSERT INTO Genres (genre_id, title) VALUES ('det_artifact', 'Артефакт-детективы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_action', 'Боевик') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_lady', 'Дамский детективный роман') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('detective', 'Детективы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_other', 'Детективы и триллеры: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_irony', 'Иронический детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_history', 'Исторический детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_classic', 'Классический детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_crime', 'Криминальный детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_hard', 'Крутой детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_political', 'Политический детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_police', 'Полицейский детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_maniac', 'Про маньяков') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_su', 'Советский детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('thriller', 'Триллер') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('det_espionage', 'Шпионский детектив') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Children's Literature
INSERT INTO Genres (genre_id, title) VALUES ('children', 'Детская литература: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_education', 'Детская образовательная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_game', 'Детский досуг') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_folklore', 'Детский фольклор') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('foreign_children', 'Зарубежная литература для детей') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_classical', 'Классическая детская литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_tale', 'Литературные и народные сказки: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('folk_tale', 'Народные сказки') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_tale_rus', 'Русские сказки') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_tale_foreign_writers', 'Сказки зарубежных писателей') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_tale_russian_writers', 'Сказки отечественных писателей') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_prose_history', 'Детская проза: военная и историческая') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_adv_animal', 'Детская проза: о животных и природе') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_adv', 'Детская проза: приключения') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_prose', 'Детская проза: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_prose_romantic', 'Детская проза: романтическая') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_prose_humor', 'Детская проза: юмористическая, о школе и школьниках') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_sf_space', 'Детская фантастика: космические приключения, пришельцы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_sf', 'Детская фантастика: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_sf_hronoopera', 'Детская фантастика: темпоральная, попаданцы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_sf_horror', 'Детская фантастика: ужасы и мистика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_sf_fantasy', 'Детская фантастика: фэнтези') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_det_children_detectives', 'Детские детективы: дети-сыщики') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_det_animal_detectives', 'Детские детективы: животные-сыщики') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_det_other', 'Детские детективы: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_det', 'Детские остросюжетные: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_dramaturgy', 'Драматургия для детей и подростков') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('child_verse', 'Стихи для детей и подростков') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Non-Fiction
INSERT INTO Genres (genre_id, title) VALUES ('nonf_biography_celebrities', 'Биографии и мемуары: звезды кино, театра, балета, шоу-бизнеса') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_biography_historical', 'Биографии и мемуары: исторические персоны') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('about_musicians', 'Биографии и мемуары: музыканты, композиторы, художники') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_biography_writers', 'Биографии и мемуары: писатели, поэты, драматурги') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_biography', 'Биографии и мемуары: прочее') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_military', 'Военная документалистика и аналитика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('military_special', 'Военное дело') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_biography_military_figures', 'Военные мемуары') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('travel_notes', 'География, путевые заметки') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonfiction', 'Документальная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_publicism', 'Публицистика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Home & Family
INSERT INTO Genres (genre_id, title) VALUES ('auto_regulations', 'Автомобили и ПДД') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_sport', 'Боевые искусства, спорт') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_pets', 'Домашние животные') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home', 'Домоводство') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_health', 'Здоровье') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_collecting', 'Коллекционирование') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_cooking', 'Кулинария') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_pedagogy', 'Педагогика, воспитание детей, литература для родителей') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_psychology_popular', 'Популярная психология') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_entertain', 'Развлечения') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_garden', 'Сад и огород') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_diy', 'Сделай сам') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('family', 'Семейные отношения') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_sex', 'Семейные отношения, секс') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('home_crafts', 'Хобби и ремесла') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Drama
INSERT INTO Genres (genre_id, title) VALUES ('drama_antique', 'Античная драма') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('drama', 'Драма') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('dramaturgy', 'Драматургия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('comedy', 'Комедия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('vaudeville', 'Мистерия, буффонада, водевиль') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('screenplays', 'Сценарий') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('tragedy', 'Трагедия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Art & Design
INSERT INTO Genres (genre_id, title) VALUES ('painting', 'Живопись, альбомы, иллюстрированные каталоги') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('design', 'Искусство и Дизайн') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('art_criticism', 'Искусствоведение') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('cine', 'Кино') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('nonf_criticism', 'Критика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_culture', 'Культурология') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('art_world_culture', 'Мировая художественная культура') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('music', 'Музыка') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('notes', 'Партитуры') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('architecture_book', 'Скульптура и архитектура') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('theatre', 'Театр') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Computers
INSERT INTO Genres (genre_id, title) VALUES ('computers', 'Зарубежная компьютерная, околокомпьютерная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('comp_hard', 'Компьютерное ''железо'' (аппаратное обеспечение), цифровая обработка сигналов') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('comp_www', 'ОС и Сети, интернет') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('comp_db', 'Программирование, программы, базы данных') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('tbg_computers', 'Учебные пособия, самоучители') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Romance
INSERT INTO Genres (genre_id, title) VALUES ('love_history', 'Исторические любовные романы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love_short', 'Короткие любовные романы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love_sf', 'Любовное фэнтези, любовно-фантастические романы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love', 'Любовные романы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love_detective', 'Остросюжетные любовные романы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love_hard', 'Порно') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love_contemporary', 'Современные любовные романы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('love_erotica', 'Эротическая литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Science & Education
INSERT INTO Genres (genre_id, title) VALUES ('sci_medicine_alternative', 'Альтернативная медицина') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_theories', 'Альтернативные науки и научные теории') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_cosmos', 'Астрономия и Космос') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_biology', 'Биология, биофизика, биохимия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_botany', 'Ботаника') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_veterinary', 'Ветеринария') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('military_history', 'Военная история') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_oriental', 'Востоковедение') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_geo', 'Геология и география') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_state', 'Государство и право') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_zoo', 'Зоология') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_history', 'История') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_philology', 'Литературоведение') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_math', 'Математика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_medicine', 'Медицина') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('science', 'Научная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_popular', 'Образовательная, прикладная, научно-популярная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_social_studies', 'Обществознание, социология') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_politics', 'Политика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_psychology', 'Психология и психотерапия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_phys', 'Физика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_philosophy', 'Философия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_chem', 'Химия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_ecology', 'Экология') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_economy', 'Экономика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_juris', 'Юриспруденция') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_linguistic', 'Языкознание, иностранные языки') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Poetry
INSERT INTO Genres (genre_id, title) VALUES ('palindromes', 'Визуальная и экспериментальная поэзия, верлибры, палиндромы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_for_classical', 'Классическая зарубежная поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_classical', 'Классическая поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_rus_classical', 'Классическая русская поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('lyrics', 'Лирика') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('song_poetry', 'Песенная поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry', 'Поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_east', 'Поэзия Востока') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poem', 'Поэма, эпическая поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_for_modern', 'Современная зарубежная поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_modern', 'Современная поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('poetry_rus_modern', 'Современная русская поэзия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('humor_verse', 'Юмористические стихи, басни') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Adventure
INSERT INTO Genres (genre_id, title) VALUES ('adv_story', 'Авантюрный роман') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adv_indian', 'Вестерн, про индейцев') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adv_history', 'Исторические приключения') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adv_maritime', 'Морские приключения') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adventure', 'Приключения') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adv_modern', 'Приключения в современном мире') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adv_animal', 'Природа и животные') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('adv_geo', 'Путешествия и география') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('tale_chivalry', 'Рыцарский роман') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Prose
INSERT INTO Genres (genre_id, title) VALUES ('aphorisms', 'Афоризмы, цитаты') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('gothic_novel', 'Готический роман') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('foreign_prose', 'Зарубежная классическая проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_history', 'Историческая проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_classic', 'Классическая проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('literature_18', 'Классическая проза XVII-XVIII веков') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('literature_19', 'Классическая проза ХIX века') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('literature_20', 'Классическая проза ХX века') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_counter', 'Контркультура') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_magic', 'Магический реализм') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('story', 'Малые литературные формы прозы: рассказы, эссе, новеллы, феерия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose', 'Проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_military', 'Проза о войне') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('great_story', 'Роман, повесть') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_rus_classic', 'Русская классическая проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_su_classics', 'Советская классическая проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_contemporary', 'Современная русская и зарубежная проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('foreign_antique', 'Средневековая классическая проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_abs', 'Фантасмагория, абсурдистская проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('prose_neformatny', 'Экспериментальная, неформатная проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('epistolary_fiction', 'Эпистолярная проза') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Miscellaneous
INSERT INTO Genres (genre_id, title) VALUES ('periodic', 'Журналы, газеты') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('comics', 'Комиксы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('fan_translation', 'Любительский перевод') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('computer_translation', 'Машинный перевод') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('unfinished', 'Незавершенное') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('other', 'Неотсортированное') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('network_literature', 'Самиздат, сетевая литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('fanfiction', 'Фанфик') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Religion & Esoterics
INSERT INTO Genres (genre_id, title) VALUES ('astrology', 'Астрология и хиромантия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_budda', 'Буддизм') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_hinduism', 'Индуизм') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_islam', 'Ислам') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_judaism', 'Иудаизм') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_catholicism', 'Католицизм') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_orthodoxy', 'Православие') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_protestantism', 'Протестантизм') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_religion', 'Религиоведение') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion', 'Религия, религиозная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_self', 'Самосовершенствование') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_christianity', 'Христианство') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_esoterics', 'Эзотерика, эзотерическая литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('religion_paganism', 'Язычество') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Reference & Antique
INSERT INTO Genres (genre_id, title) VALUES ('geo_guides', 'Путеводители, карты, атласы') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('ref_guide', 'Руководства') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('ref_dict', 'Словари') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('reference', 'Справочная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('ref_ref', 'Справочники') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('ref_encyc', 'Энциклопедии') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('antique', 'antique') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('antique_ant', 'Античная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('antique_east', 'Древневосточная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('antique_russian', 'Древнерусская литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('antique_european', 'Европейская старинная литература') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;

-- Technical
INSERT INTO Genres (genre_id, title) VALUES ('auto_business', 'Автодело') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('military_weapon', 'Военное дело, военная техника и вооружение') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('equ_history', 'История техники') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_metal', 'Металлургия') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
INSERT INTO Genres (genre_id, title) VALUES ('sci_radio', 'Радиоэлектроника') ON CONFLICT(genre_id) DO UPDATE SET title = excluded.title;
