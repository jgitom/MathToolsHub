(() => {
  "use strict";

  if (window.__MTH_UNIVERSAL_LANGUAGE__) return;
  window.__MTH_UNIVERSAL_LANGUAGE__ = true;
  if (location.pathname.includes("/learning-programs/")) document.documentElement.classList.add("mth-learning-page");

  const STORAGE_KEY = "mathToolsHubLanguage";
  const languages = {
    en: { label: "English", locale: "en-GB", dir: "ltr" },
    ms: { label: "Bahasa Malaysia", locale: "ms-MY", dir: "ltr" },
    zh: { label: "中文（普通话）", locale: "zh-CN", dir: "ltr" }
  };
  const keys = [
    "Select language", "Home", "Back", "Return to home", "All Games", "All programmes",
    "Learning catalogue", "Mathematics Games", "MathToolsHub Tools", "Quizzes", "Games", "Tools",
    "Programmes", "Learning programmes", "Search", "Search games", "All", "All levels",
    "Preschool", "Primary", "Secondary", "Year", "Form", "Activities", "Activity", "Overview",
    "Learn", "Mission", "Project", "Assessment", "Reflection", "Certificate", "Progress", "Score",
    "Level", "Topic", "Question", "Answer", "Solution", "Hint", "Show Hint", "Start", "Play",
    "Continue", "Next", "Previous", "Submit", "Check answer", "Try again", "Restart", "Reset",
    "Pause", "Resume", "Settings", "Sound", "Language", "Close", "Open", "Download", "Print",
    "Save", "Cancel", "Sign in", "Sign out", "Create account", "User Account", "Email address",
    "Password", "Free", "Premium", "Subscribe", "Privacy Policy", "Terms of Service", "Refund Policy",
    "Cancellation Policy", "Contact support", "Effective date:", "Correct!", "Incorrect", "Completed",
    "Loading…", "No activities found.", "Try another search or learning path.", "Choose your game",
    "Start learning free", "Free Access Preview", "Primary education", "Secondary education",
    "Learning Objectives", "Learning Outcomes", "Student Product", "Assessment Approach",
    "Mark as learned", "Submit Assessment", "Print Certificate", "Reset Programme Progress"
  ];

  const values = {
    id: ["Pilih bahasa","Beranda","Kembali","Kembali ke beranda","Semua Game","Semua program","Katalog pembelajaran","Game Matematika","Alat MathToolsHub","Kuis","Game","Alat","Program","Program pembelajaran","Cari","Cari game","Semua","Semua jenjang","Prasekolah","Sekolah Dasar","Sekolah Menengah","Kelas","Tingkat","Aktivitas","Aktivitas","Ringkasan","Belajar","Misi","Proyek","Penilaian","Refleksi","Sertifikat","Kemajuan","Skor","Level","Topik","Pertanyaan","Jawaban","Solusi","Petunjuk","Tampilkan Petunjuk","Mulai","Main","Lanjutkan","Berikutnya","Sebelumnya","Kirim","Periksa jawaban","Coba lagi","Mulai ulang","Atur ulang","Jeda","Lanjutkan","Pengaturan","Suara","Bahasa","Tutup","Buka","Unduh","Cetak","Simpan","Batal","Masuk","Keluar","Buat akun","Akun Pengguna","Alamat email","Kata sandi","Gratis","Premium","Berlangganan","Kebijakan Privasi","Ketentuan Layanan","Kebijakan Pengembalian Dana","Kebijakan Pembatalan","Hubungi dukungan","Tanggal berlaku:","Benar!","Salah","Selesai","Memuat…","Tidak ada aktivitas yang ditemukan.","Coba pencarian atau jalur pembelajaran lain.","Pilih game Anda","Mulai belajar gratis","Pratinjau Akses Gratis","Pendidikan dasar","Pendidikan menengah","Tujuan Pembelajaran","Hasil Pembelajaran","Produk Siswa","Pendekatan Penilaian","Tandai sebagai dipelajari","Kirim Penilaian","Cetak Sertifikat","Atur Ulang Kemajuan Program"],
    ar: ["اختر اللغة","الرئيسية","رجوع","العودة إلى الرئيسية","جميع الألعاب","جميع البرامج","دليل التعلّم","ألعاب الرياضيات","أدوات MathToolsHub","الاختبارات","الألعاب","الأدوات","البرامج","برامج التعلّم","بحث","البحث في الألعاب","الكل","جميع المستويات","ما قبل المدرسة","الابتدائي","الثانوي","السنة","الصف","الأنشطة","نشاط","نظرة عامة","تعلّم","مهمة","مشروع","تقييم","تأمل","شهادة","التقدم","النتيجة","المستوى","الموضوع","السؤال","الإجابة","الحل","تلميح","إظهار التلميح","ابدأ","العب","متابعة","التالي","السابق","إرسال","تحقق من الإجابة","حاول مرة أخرى","إعادة البدء","إعادة ضبط","إيقاف مؤقت","استئناف","الإعدادات","الصوت","اللغة","إغلاق","فتح","تنزيل","طباعة","حفظ","إلغاء","تسجيل الدخول","تسجيل الخروج","إنشاء حساب","حساب المستخدم","البريد الإلكتروني","كلمة المرور","مجاني","مميز","اشترك","سياسة الخصوصية","شروط الخدمة","سياسة الاسترداد","سياسة الإلغاء","اتصل بالدعم","تاريخ السريان:","صحيح!","غير صحيح","مكتمل","جارٍ التحميل…","لم يتم العثور على أنشطة.","جرّب بحثًا أو مسار تعلّم آخر.","اختر لعبتك","ابدأ التعلّم مجانًا","معاينة الوصول المجاني","التعليم الابتدائي","التعليم الثانوي","أهداف التعلّم","نتائج التعلّم","منتج الطالب","أسلوب التقييم","وضع علامة تم التعلّم","إرسال التقييم","طباعة الشهادة","إعادة ضبط تقدم البرنامج"],
    fr: ["Choisir la langue","Accueil","Retour","Retour à l’accueil","Tous les jeux","Tous les programmes","Catalogue d’apprentissage","Jeux de mathématiques","Outils MathToolsHub","Quiz","Jeux","Outils","Programmes","Programmes d’apprentissage","Rechercher","Rechercher des jeux","Tous","Tous les niveaux","Préscolaire","Primaire","Secondaire","Année","Classe","Activités","Activité","Aperçu","Apprendre","Mission","Projet","Évaluation","Réflexion","Certificat","Progression","Score","Niveau","Sujet","Question","Réponse","Solution","Indice","Afficher l’indice","Commencer","Jouer","Continuer","Suivant","Précédent","Envoyer","Vérifier la réponse","Réessayer","Recommencer","Réinitialiser","Pause","Reprendre","Paramètres","Son","Langue","Fermer","Ouvrir","Télécharger","Imprimer","Enregistrer","Annuler","Se connecter","Se déconnecter","Créer un compte","Compte utilisateur","Adresse e-mail","Mot de passe","Gratuit","Premium","S’abonner","Politique de confidentialité","Conditions d’utilisation","Politique de remboursement","Politique d’annulation","Contacter l’assistance","Date d’entrée en vigueur :","Correct !","Incorrect","Terminé","Chargement…","Aucune activité trouvée.","Essayez une autre recherche ou un autre parcours.","Choisissez votre jeu","Commencer gratuitement","Aperçu gratuit","Enseignement primaire","Enseignement secondaire","Objectifs d’apprentissage","Résultats d’apprentissage","Production de l’élève","Méthode d’évaluation","Marquer comme appris","Envoyer l’évaluation","Imprimer le certificat","Réinitialiser la progression"],
    es: ["Seleccionar idioma","Inicio","Volver","Volver al inicio","Todos los juegos","Todos los programas","Catálogo de aprendizaje","Juegos de matemáticas","Herramientas de MathToolsHub","Cuestionarios","Juegos","Herramientas","Programas","Programas de aprendizaje","Buscar","Buscar juegos","Todos","Todos los niveles","Preescolar","Primaria","Secundaria","Año","Curso","Actividades","Actividad","Resumen","Aprender","Misión","Proyecto","Evaluación","Reflexión","Certificado","Progreso","Puntuación","Nivel","Tema","Pregunta","Respuesta","Solución","Pista","Mostrar pista","Comenzar","Jugar","Continuar","Siguiente","Anterior","Enviar","Comprobar respuesta","Intentar de nuevo","Reiniciar","Restablecer","Pausa","Reanudar","Ajustes","Sonido","Idioma","Cerrar","Abrir","Descargar","Imprimir","Guardar","Cancelar","Iniciar sesión","Cerrar sesión","Crear cuenta","Cuenta de usuario","Correo electrónico","Contraseña","Gratis","Premium","Suscribirse","Política de privacidad","Términos del servicio","Política de reembolso","Política de cancelación","Contactar con soporte","Fecha de vigencia:","¡Correcto!","Incorrecto","Completado","Cargando…","No se encontraron actividades.","Prueba otra búsqueda o ruta de aprendizaje.","Elige tu juego","Comenzar gratis","Vista previa gratuita","Educación primaria","Educación secundaria","Objetivos de aprendizaje","Resultados de aprendizaje","Producto del estudiante","Método de evaluación","Marcar como aprendido","Enviar evaluación","Imprimir certificado","Restablecer progreso"],
    ko: ["언어 선택","홈","뒤로","홈으로 돌아가기","모든 게임","모든 프로그램","학습 카탈로그","수학 게임","MathToolsHub 도구","퀴즈","게임","도구","프로그램","학습 프로그램","검색","게임 검색","전체","모든 수준","유치원","초등","중등","학년","학년","활동","활동","개요","학습","미션","프로젝트","평가","성찰","인증서","진행률","점수","레벨","주제","문제","답","풀이","힌트","힌트 보기","시작","플레이","계속","다음","이전","제출","답 확인","다시 시도","다시 시작","초기화","일시 정지","계속","설정","소리","언어","닫기","열기","다운로드","인쇄","저장","취소","로그인","로그아웃","계정 만들기","사용자 계정","이메일 주소","비밀번호","무료","프리미엄","구독","개인정보 처리방침","서비스 약관","환불 정책","취소 정책","고객지원 문의","시행일:","정답!","오답","완료","불러오는 중…","활동을 찾을 수 없습니다.","다른 검색어나 학습 경로를 시도하세요.","게임 선택","무료로 학습 시작","무료 이용 미리보기","초등 교육","중등 교육","학습 목표","학습 성과","학생 결과물","평가 방법","학습 완료 표시","평가 제출","인증서 인쇄","프로그램 진행 초기화"],
    ja: ["言語を選択","ホーム","戻る","ホームに戻る","すべてのゲーム","すべてのプログラム","学習カタログ","数学ゲーム","MathToolsHub ツール","クイズ","ゲーム","ツール","プログラム","学習プログラム","検索","ゲームを検索","すべて","すべてのレベル","就学前","初等","中等","学年","学年","アクティビティ","アクティビティ","概要","学ぶ","ミッション","プロジェクト","評価","振り返り","修了証","進捗","スコア","レベル","トピック","問題","答え","解答","ヒント","ヒントを表示","開始","プレイ","続ける","次へ","前へ","送信","答えを確認","もう一度","再開","リセット","一時停止","再開","設定","音声","言語","閉じる","開く","ダウンロード","印刷","保存","キャンセル","ログイン","ログアウト","アカウント作成","ユーザーアカウント","メールアドレス","パスワード","無料","プレミアム","購読","プライバシーポリシー","利用規約","返金ポリシー","キャンセルポリシー","サポートに連絡","発効日:","正解！","不正解","完了","読み込み中…","アクティビティが見つかりません。","別の検索または学習経路をお試しください。","ゲームを選ぶ","無料で学習を開始","無料アクセスプレビュー","初等教育","中等教育","学習目標","学習成果","生徒の成果物","評価方法","学習済みにする","評価を送信","修了証を印刷","進捗をリセット"],
    it: ["Seleziona lingua","Home","Indietro","Torna alla home","Tutti i giochi","Tutti i programmi","Catalogo didattico","Giochi di matematica","Strumenti MathToolsHub","Quiz","Giochi","Strumenti","Programmi","Programmi didattici","Cerca","Cerca giochi","Tutti","Tutti i livelli","Prescolare","Primaria","Secondaria","Anno","Classe","Attività","Attività","Panoramica","Impara","Missione","Progetto","Valutazione","Riflessione","Certificato","Progresso","Punteggio","Livello","Argomento","Domanda","Risposta","Soluzione","Suggerimento","Mostra suggerimento","Inizia","Gioca","Continua","Avanti","Indietro","Invia","Controlla risposta","Riprova","Ricomincia","Reimposta","Pausa","Riprendi","Impostazioni","Audio","Lingua","Chiudi","Apri","Scarica","Stampa","Salva","Annulla","Accedi","Esci","Crea account","Account utente","Indirizzo email","Password","Gratis","Premium","Abbonati","Informativa sulla privacy","Termini di servizio","Politica di rimborso","Politica di cancellazione","Contatta l’assistenza","Data di entrata in vigore:","Corretto!","Errato","Completato","Caricamento…","Nessuna attività trovata.","Prova un’altra ricerca o percorso.","Scegli il tuo gioco","Inizia gratis","Anteprima accesso gratuito","Istruzione primaria","Istruzione secondaria","Obiettivi di apprendimento","Risultati di apprendimento","Prodotto dello studente","Metodo di valutazione","Segna come appreso","Invia valutazione","Stampa certificato","Reimposta progresso"],
    pt: ["Selecionar idioma","Início","Voltar","Voltar ao início","Todos os jogos","Todos os programas","Catálogo de aprendizagem","Jogos de matemática","Ferramentas MathToolsHub","Questionários","Jogos","Ferramentas","Programas","Programas de aprendizagem","Pesquisar","Pesquisar jogos","Todos","Todos os níveis","Pré-escolar","Primário","Secundário","Ano","Turma","Atividades","Atividade","Visão geral","Aprender","Missão","Projeto","Avaliação","Reflexão","Certificado","Progresso","Pontuação","Nível","Tópico","Pergunta","Resposta","Solução","Dica","Mostrar dica","Começar","Jogar","Continuar","Seguinte","Anterior","Enviar","Verificar resposta","Tentar novamente","Reiniciar","Repor","Pausa","Retomar","Definições","Som","Idioma","Fechar","Abrir","Transferir","Imprimir","Guardar","Cancelar","Iniciar sessão","Terminar sessão","Criar conta","Conta do utilizador","Endereço de email","Palavra-passe","Grátis","Premium","Subscrever","Política de Privacidade","Termos de Serviço","Política de Reembolso","Política de Cancelamento","Contactar suporte","Data de entrada em vigor:","Correto!","Incorreto","Concluído","A carregar…","Nenhuma atividade encontrada.","Tente outra pesquisa ou percurso de aprendizagem.","Escolha o seu jogo","Começar gratuitamente","Pré-visualização gratuita","Ensino primário","Ensino secundário","Objetivos de aprendizagem","Resultados de aprendizagem","Produto do aluno","Método de avaliação","Marcar como aprendido","Enviar avaliação","Imprimir certificado","Repor progresso"],
    ms: ["Pilih bahasa","Utama","Kembali","Kembali ke laman utama","Semua Permainan","Semua program","Katalog pembelajaran","Permainan Matematik","Alatan MathToolsHub","Kuiz","Permainan","Alatan","Program","Program pembelajaran","Cari","Cari permainan","Semua","Semua peringkat","Prasekolah","Rendah","Menengah","Tahun","Tingkatan","Aktiviti","Aktiviti","Ringkasan","Belajar","Misi","Projek","Pentaksiran","Refleksi","Sijil","Kemajuan","Skor","Tahap","Topik","Soalan","Jawapan","Penyelesaian","Petunjuk","Tunjukkan Petunjuk","Mula","Main","Teruskan","Seterusnya","Sebelumnya","Hantar","Semak jawapan","Cuba lagi","Mula semula","Tetapkan semula","Jeda","Sambung","Tetapan","Bunyi","Bahasa","Tutup","Buka","Muat turun","Cetak","Simpan","Batal","Log masuk","Log keluar","Cipta akaun","Akaun Pengguna","Alamat e-mel","Kata laluan","Percuma","Premium","Langgan","Dasar Privasi","Terma Perkhidmatan","Dasar Bayaran Balik","Dasar Pembatalan","Hubungi sokongan","Tarikh berkuat kuasa:","Betul!","Salah","Selesai","Memuatkan…","Tiada aktiviti ditemui.","Cuba carian atau laluan pembelajaran lain.","Pilih permainan anda","Mula belajar secara percuma","Pratonton Akses Percuma","Pendidikan rendah","Pendidikan menengah","Objektif Pembelajaran","Hasil Pembelajaran","Hasil Murid","Kaedah Pentaksiran","Tandakan sebagai dipelajari","Hantar Pentaksiran","Cetak Sijil","Tetapkan Semula Kemajuan Program"]
  };

  const dictionaries = {};
  Object.entries(values).forEach(([code, translated]) => {
    dictionaries[code] = Object.fromEntries(keys.map((key, index) => [key, translated[index] || key]));
  });
  dictionaries.en = Object.fromEntries(keys.map(key => [key, key]));
  dictionaries.zh = Object.fromEntries(keys.map(key => [key, key]));
  const pageTranslations = {
    id: {"Structured mathematics learning":"Pembelajaran matematika terstruktur","Build stronger mathematics skills.":"Bangun keterampilan matematika yang lebih kuat.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"Sumber interaktif berfokus kurikulum untuk mendukung pembelajaran percaya diri dari prasekolah hingga sekolah menengah.","Explore programmes":"Jelajahi program","View platform overview":"Lihat ringkasan platform","Learning resources for every stage":"Sumber belajar untuk setiap jenjang","Ready to begin learning?":"Siap mulai belajar?","Open catalogue":"Buka katalog","Learn through play":"Belajar sambil bermain","Choose your game":"Pilih game Anda"},
    ar: {"Structured mathematics learning":"تعلّم رياضيات منظّم","Build stronger mathematics skills.":"طوّر مهارات رياضية أقوى.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"موارد تفاعلية تركّز على المنهج لدعم التعلّم بثقة من مرحلة ما قبل المدرسة حتى التعليم الثانوي.","Explore programmes":"استكشف البرامج","View platform overview":"عرض نظرة عامة على المنصة","Learning resources for every stage":"موارد تعليمية لكل مرحلة","Ready to begin learning?":"هل أنت مستعد لبدء التعلّم؟","Open catalogue":"فتح الدليل","Learn through play":"تعلّم من خلال اللعب","Choose your game":"اختر لعبتك"},
    fr: {"Structured mathematics learning":"Apprentissage structuré des mathématiques","Build stronger mathematics skills.":"Renforcez vos compétences en mathématiques.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"Des ressources interactives axées sur le programme pour apprendre avec confiance, du préscolaire au secondaire.","Explore programmes":"Explorer les programmes","View platform overview":"Voir l’aperçu de la plateforme","Learning resources for every stage":"Des ressources pour chaque étape","Ready to begin learning?":"Prêt à commencer ?","Open catalogue":"Ouvrir le catalogue","Learn through play":"Apprendre en jouant","Choose your game":"Choisissez votre jeu"},
    es: {"Structured mathematics learning":"Aprendizaje estructurado de matemáticas","Build stronger mathematics skills.":"Desarrolla habilidades matemáticas más sólidas.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"Recursos interactivos centrados en el currículo para aprender con confianza desde preescolar hasta secundaria.","Explore programmes":"Explorar programas","View platform overview":"Ver resumen de la plataforma","Learning resources for every stage":"Recursos para cada etapa","Ready to begin learning?":"¿Listo para comenzar?","Open catalogue":"Abrir catálogo","Learn through play":"Aprender jugando","Choose your game":"Elige tu juego"},
    ko: {"Structured mathematics learning":"체계적인 수학 학습","Build stronger mathematics skills.":"더 탄탄한 수학 실력을 키우세요.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"유치원부터 중등 교육까지 자신감 있는 학습을 돕는 교육과정 중심의 상호작용 자료입니다.","Explore programmes":"프로그램 둘러보기","View platform overview":"플랫폼 개요 보기","Learning resources for every stage":"모든 단계의 학습 자료","Ready to begin learning?":"학습을 시작할 준비가 되었나요?","Open catalogue":"카탈로그 열기","Learn through play":"놀이로 배우기","Choose your game":"게임 선택"},
    ja: {"Structured mathematics learning":"体系的な数学学習","Build stronger mathematics skills.":"より確かな数学力を身につけよう。","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"就学前から中等教育まで、自信ある学びを支えるカリキュラム重視のインタラクティブ教材です。","Explore programmes":"プログラムを見る","View platform overview":"プラットフォーム概要を見る","Learning resources for every stage":"すべての段階の学習教材","Ready to begin learning?":"学習を始める準備はできましたか？","Open catalogue":"カタログを開く","Learn through play":"遊びながら学ぶ","Choose your game":"ゲームを選ぶ"},
    it: {"Structured mathematics learning":"Apprendimento strutturato della matematica","Build stronger mathematics skills.":"Sviluppa competenze matematiche più solide.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"Risorse interattive incentrate sul programma per imparare con sicurezza dalla scuola dell’infanzia alla secondaria.","Explore programmes":"Esplora i programmi","View platform overview":"Vedi panoramica della piattaforma","Learning resources for every stage":"Risorse per ogni fase","Ready to begin learning?":"Pronto per iniziare?","Open catalogue":"Apri il catalogo","Learn through play":"Impara giocando","Choose your game":"Scegli il tuo gioco"},
    pt: {"Structured mathematics learning":"Aprendizagem estruturada de matemática","Build stronger mathematics skills.":"Desenvolva competências matemáticas mais sólidas.","Interactive, curriculum-focused resources designed to support confident learning from preschool through secondary education.":"Recursos interativos centrados no currículo para apoiar uma aprendizagem confiante do pré-escolar ao secundário.","Explore programmes":"Explorar programas","View platform overview":"Ver visão geral da plataforma","Learning resources for every stage":"Recursos para todas as etapas","Ready to begin learning?":"Pronto para começar?","Open catalogue":"Abrir catálogo","Learn through play":"Aprender a brincar","Choose your game":"Escolha o seu jogo"}
  };
  pageTranslations.ms ||= {};
  pageTranslations.zh ||= {};
  pageTranslations.en = {
    "← Semua Permainan":"← All Games","Mula Semula":"Restart","Strategi kewangan · Matematik kehidupan sebenar":"Financial strategy · Real-world mathematics","Mulakan dengan RM10,000. Pilih peluang perniagaan, jawab cabaran matematik dan bina nilai bersih RM25,000 dalam 12 bulan.":"Start with RM10,000. Choose business opportunities, solve mathematics challenges, and build RM25,000 in net worth over 12 months.","Bulan":"Month","Tunai":"Cash","Aset":"Assets","Nilai bersih":"Net worth","Reputasi":"Reputation","Pilih peluang bulan ini":"Choose this month's opportunity","Kos ditolak dahulu. Jawapan tepat meningkatkan peluang keuntungan; jawapan salah menambah risiko kerugian.":"The cost is deducted first. A correct answer improves the chance of profit; a wrong answer increases the risk of loss.","Sasaran Jutawan":"Wealth Target","menuju RM25,000":"towards RM25,000","Lejar Perniagaan":"Business Ledger","Modal permulaan diterima: RM10,000.":"Starting capital received: RM10,000.","Jutawan Pintar!":"Smart Millionaire!","Main Lagi":"Play Again","Permainan Kata Nusantara":"Nusantara Word Game","Baki huruf: 0":"Letters remaining: 0","Nama Pemain 1":"Player 1 Name","Nama Pemain 2":"Player 2 Name","Pemain 1":"Player 1","Pemain 2":"Player 2","markah":"points","Rak Huruf":"Letter Rack","Hantar Kata":"Submit Word","Batal Susunan":"Undo Placement","Tukar Huruf":"Exchange Letter","Langkau Giliran":"Pass Turn","Pilih huruf pada rak, kemudian klik petak papan.":"Select a letter from the rack, then click a board square.","Peraturan ringkas":"Quick rules","• Giliran pertama mesti melalui petak ★.":"• The first turn must cross the ★ square.","• Semua huruf baharu mesti berada pada satu baris atau lajur.":"• All new letters must be in one row or column.","• Huruf baharu mesti bersambung dengan perkataan sedia ada.":"• New letters must connect to an existing word.","• Bonus DL/TL menggandakan huruf; DW/TW menggandakan perkataan.":"• DL/TL multiply letters; DW/TW multiply words."
  };
  Object.assign(pageTranslations.ms, {
    "← All Games":"← Semua Permainan","Main Menu":"Menu Utama","A Formula-style circuit with fast straights, a hairpin, an S-chicane, and seven AI rivals.":"Litar gaya Formula dengan laluan lurus pantas, selekoh tajam, S-chicane dan tujuh pesaing AI.","Position":"Kedudukan","Lap":"Pusingan","Speed":"Kelajuan","Gear":"Gear","Time":"Masa","Enter the 3D Grand Prix":"Sertai Grand Prix 3D","Control a true 3D Formula car, find the racing line, and overtake seven computer drivers across three laps.":"Kawal kereta Formula 3D sebenar, cari garisan perlumbaan dan potong tujuh pemandu komputer dalam tiga pusingan.","Rookie":"Pelatih","Pro":"Pro","Champion":"Juara","Loading 3D Circuit…":"Memuatkan Litar 3D…","Preparing cars, track, lighting, and scenery.":"Menyediakan kereta, trek, pencahayaan dan pemandangan.","Race Complete!":"Perlumbaan Selesai!","Race Again":"Berlumba Lagi","← Main Menu":"← Menu Utama","Play lightweight 2D version":"Main versi 2D ringan","↶ LEFT":"↶ KIRI","RIGHT ↷":"KANAN ↷","BRAKE":"BREK","ACCELERATE":"PECUT","Keyboard: W/↑ accelerate · S/↓ brake · A/D or ←/→ steer · R resets the car · Esc opens the main menu":"Papan kekunci: W/↑ pecut · S/↓ brek · A/D atau ←/→ kemudi · R tetapkan semula kereta · Esc buka menu utama"
  });
  Object.assign(pageTranslations.zh, {
    "← Semua Permainan":"← 所有游戏","Mula Semula":"重新开始","Strategi kewangan · Matematik kehidupan sebenar":"金融策略 · 生活数学","Mulakan dengan RM10,000. Pilih peluang perniagaan, jawab cabaran matematik dan bina nilai bersih RM25,000 dalam 12 bulan.":"从 RM10,000 开始，选择商业机会、解决数学挑战，并在 12 个月内将净资产增至 RM25,000。","Bulan":"月份","Tunai":"现金","Aset":"资产","Nilai bersih":"净资产","Reputasi":"声誉","Pilih peluang bulan ini":"选择本月机会","Kos ditolak dahulu. Jawapan tepat meningkatkan peluang keuntungan; jawapan salah menambah risiko kerugian.":"成本会先扣除。答对可提高盈利机会，答错则增加亏损风险。","Sasaran Jutawan":"财富目标","menuju RM25,000":"目标 RM25,000","Lejar Perniagaan":"商业账簿","Modal permulaan diterima: RM10,000.":"已获得启动资金：RM10,000。","Jutawan Pintar!":"智慧富翁！","Main Lagi":"再玩一次","Permainan Kata Nusantara":"南洋文字游戏","Baki huruf: 0":"剩余字母：0","Nama Pemain 1":"玩家 1 名称","Nama Pemain 2":"玩家 2 名称","Pemain 1":"玩家 1","Pemain 2":"玩家 2","markah":"分","Rak Huruf":"字母架","Hantar Kata":"提交单词","Batal Susunan":"撤销排列","Tukar Huruf":"交换字母","Langkau Giliran":"跳过回合","Pilih huruf pada rak, kemudian klik petak papan.":"先选择字母架上的字母，然后点击棋盘格。","Peraturan ringkas":"简要规则","• Giliran pertama mesti melalui petak ★.":"• 第一回合必须经过 ★ 格。","• Semua huruf baharu mesti berada pada satu baris atau lajur.":"• 所有新字母必须位于同一行或同一列。","• Huruf baharu mesti bersambung dengan perkataan sedia ada.":"• 新字母必须与已有单词相连。","• Bonus DL/TL menggandakan huruf; DW/TW menggandakan perkataan.":"• DL/TL 增加字母分；DW/TW 增加单词分。","← All Games":"← 所有游戏","Main Menu":"主菜单","A Formula-style circuit with fast straights, a hairpin, an S-chicane, and seven AI rivals.":"在拥有高速直道、发夹弯、S 型弯和七名 AI 对手的方程式赛道上竞速。","Position":"排名","Lap":"圈数","Speed":"速度","Gear":"挡位","Time":"时间","Enter the 3D Grand Prix":"进入 3D 大奖赛","Control a true 3D Formula car, find the racing line, and overtake seven computer drivers across three laps.":"驾驶真正的 3D 方程式赛车，寻找最佳路线，并在三圈比赛中超越七名电脑车手。","Rookie":"新手","Pro":"专业","Champion":"冠军","Loading 3D Circuit…":"正在加载 3D 赛道…","Preparing cars, track, lighting, and scenery.":"正在准备赛车、赛道、灯光和场景。","Race Complete!":"比赛完成！","Race Again":"再次比赛","← Main Menu":"← 主菜单","Play lightweight 2D version":"玩轻量 2D 版本","↶ LEFT":"↶ 左转","RIGHT ↷":"右转 ↷","BRAKE":"刹车","ACCELERATE":"加速","Keyboard: W/↑ accelerate · S/↓ brake · A/D or ←/→ steer · R resets the car · Esc opens the main menu":"键盘：W/↑ 加速 · S/↓ 刹车 · A/D 或 ←/→ 转向 · R 重置赛车 · Esc 打开主菜单"
  });
  Object.assign(pageTranslations.en, {"Gerai Minuman":"Drink Stall","Kedai Dalam Talian":"Online Shop","Kebun Pintar":"Smart Farm","Dana Simpanan":"Savings Fund","Studio Kreatif":"Creative Studio","Teknologi Hijau":"Green Technology","Untung":"Profit","Diskaun":"Discount","Peratus":"Percentage","Faedah mudah":"Simple interest","Margin untung":"Profit margin","Pertumbuhan":"Growth","Usahawan Sedang Berkembang":"Growing Entrepreneur","Anda Jutawan Pintar!":"You are a Smart Millionaire!","Pilih satu huruf daripada rak dahulu.":"Select a letter from the rack first.","Petak itu sudah mempunyai huruf.":"That square already contains a letter.","Susunan dibatalkan.":"Placement cancelled.","Letakkan sekurang-kurangnya satu huruf.":"Place at least one letter.","Huruf baharu mesti berada pada satu baris atau satu lajur.":"New letters must be in one row or one column.","Kata pertama mesti melalui petak ★.":"The first word must cross the ★ square.","Susunan mesti bersambung dengan huruf yang sudah ada.":"The placement must connect to an existing letter.","Tidak boleh ada ruang kosong dalam perkataan.":"A word cannot contain an empty space.","Satu huruf sahaja belum membentuk perkataan.":"A single letter does not form a word yet.","Batalkan susunan dahulu sebelum melangkau.":"Undo the placement before passing.","Giliran dilangkau.":"Turn passed.","Batalkan susunan sebelum menukar huruf.":"Undo the placement before exchanging a letter.","Pilih satu huruf yang hendak ditukar.":"Select a letter to exchange.","Beg huruf sudah kosong.":"The letter bag is empty.","Huruf ditukar. Giliran berpindah.":"Letter exchanged. The turn passes to the next player."});
  Object.assign(pageTranslations.zh, {"Gerai Minuman":"饮料摊","Kedai Dalam Talian":"网店","Kebun Pintar":"智慧农场","Dana Simpanan":"储蓄基金","Studio Kreatif":"创意工作室","Teknologi Hijau":"绿色科技","Untung":"利润","Diskaun":"折扣","Peratus":"百分比","Faedah mudah":"单利","Margin untung":"利润率","Pertumbuhan":"增长","Usahawan Sedang Berkembang":"成长中的企业家","Anda Jutawan Pintar!":"你是智慧富翁！","Pilih satu huruf daripada rak dahulu.":"请先从字母架选择一个字母。","Petak itu sudah mempunyai huruf.":"该格已有字母。","Susunan dibatalkan.":"排列已撤销。","Letakkan sekurang-kurangnya satu huruf.":"请至少放置一个字母。","Huruf baharu mesti berada pada satu baris atau satu lajur.":"新字母必须位于同一行或同一列。","Kata pertama mesti melalui petak ★.":"第一个单词必须经过 ★ 格。","Susunan mesti bersambung dengan huruf yang sudah ada.":"排列必须连接已有字母。","Tidak boleh ada ruang kosong dalam perkataan.":"单词中不能有空格。","Satu huruf sahaja belum membentuk perkataan.":"单个字母尚未构成单词。","Batalkan susunan dahulu sebelum melangkau.":"跳过前请先撤销排列。","Giliran dilangkau.":"本回合已跳过。","Batalkan susunan sebelum menukar huruf.":"交换字母前请先撤销排列。","Pilih satu huruf yang hendak ditukar.":"请选择要交换的字母。","Beg huruf sudah kosong.":"字母袋已空。","Huruf ditukar. Giliran berpindah.":"字母已交换，轮到下一位玩家。"});
  Object.assign(pageTranslations.ms, {"GRASS — reduced grip":"RUMPUT — cengkaman berkurang","CONTACT":"BERSENTUH","CAR RESET":"KERETA DITETAP SEMULA","Start 3D Race":"Mulakan Perlumbaan 3D","3D circuit ready · keyboard, touch, and responsive camera enabled":"Litar 3D sedia · papan kekunci, sentuhan dan kamera responsif diaktifkan","The 3D engine could not load. Check your internet connection and refresh.":"Enjin 3D tidak dapat dimuatkan. Semak sambungan internet dan muat semula.","3D Engine Unavailable":"Enjin 3D Tidak Tersedia","3D Formula Champion!":"Juara Formula 3D!","Grand Prix Complete!":"Grand Prix Selesai!"});
  Object.assign(pageTranslations.zh, {"GRASS — reduced grip":"草地 — 抓地力降低","CONTACT":"发生碰撞","CAR RESET":"赛车已重置","Start 3D Race":"开始 3D 比赛","3D circuit ready · keyboard, touch, and responsive camera enabled":"3D 赛道已就绪 · 支持键盘、触控和响应式镜头","The 3D engine could not load. Check your internet connection and refresh.":"无法加载 3D 引擎，请检查网络连接并刷新页面。","3D Engine Unavailable":"3D 引擎不可用","3D Formula Champion!":"3D 方程式冠军！","Grand Prix Complete!":"大奖赛完成！"});
  Object.assign(pageTranslations.en, {"Permainan Hartanah & Strategi":"Property & Strategy Game","Bina aset • Kutip sewa • Jadi taikun terakhir":"Build assets • Collect rent • Become the last tycoon","Baling Dadu":"Roll Dice","Tamat Giliran":"End Turn","Permainan Baru":"New Game","MULA":"START","PUSAT TAHANAN":"DETENTION CENTRE","REHAT PERCUMA":"FREE REST","PERGI TAHANAN":"GO TO DETENTION","Kad Peluang":"Opportunity Card","Dana Komuniti":"Community Fund","Cukai Bandar":"City Tax","Cukai Aset":"Asset Tax","Yuran Lesen":"Licence Fee","Cukai Premium":"Premium Tax","Beli":"Buy","Tidak":"No","Bankrap":"Bankrupt","Wang tidak mencukupi.":"Insufficient funds.","Permainan baru dimulakan.":"A new game has started.","Permainan tamat.":"Game over.","Bonus projek berjaya. Terima RM150.":"Successful project bonus. Receive RM150.","Kos pembaikan kecemasan. Bayar RM100.":"Emergency repair cost. Pay RM100.","Dividen pelaburan. Terima RM200.":"Investment dividend. Receive RM200.","Denda lesen perniagaan. Bayar RM75.":"Business licence fine. Pay RM75.","Geran pembangunan. Terima RM120.":"Development grant. Receive RM120.","Insurans aset. Bayar RM90.":"Asset insurance. Pay RM90."});
  Object.assign(pageTranslations.zh, {"Permainan Hartanah & Strategi":"地产与策略游戏","Bina aset • Kutip sewa • Jadi taikun terakhir":"建立资产 • 收取租金 • 成为最后的大亨","Baling Dadu":"掷骰子","Tamat Giliran":"结束回合","Permainan Baru":"新游戏","MULA":"起点","PUSAT TAHANAN":"拘留中心","REHAT PERCUMA":"免费休息","PERGI TAHANAN":"前往拘留中心","Kad Peluang":"机会卡","Dana Komuniti":"社区基金","Cukai Bandar":"城市税","Cukai Aset":"资产税","Yuran Lesen":"执照费","Cukai Premium":"高级税","Beli":"购买","Tidak":"否","Bankrap":"破产","Wang tidak mencukupi.":"资金不足。","Permainan baru dimulakan.":"新游戏已开始。","Permainan tamat.":"游戏结束。","Bonus projek berjaya. Terima RM150.":"项目成功奖励，获得 RM150。","Kos pembaikan kecemasan. Bayar RM100.":"紧急维修费，支付 RM100。","Dividen pelaburan. Terima RM200.":"投资分红，获得 RM200。","Denda lesen perniagaan. Bayar RM75.":"营业执照罚款，支付 RM75。","Geran pembangunan. Terima RM120.":"发展补助，获得 RM120。","Insurans aset. Bayar RM90.":"资产保险，支付 RM90。"});
  Object.entries(pageTranslations).forEach(([code, translated]) => Object.assign(dictionaries[code], translated));

  const originals = new WeakMap();
  const originalAttributes = new WeakMap();
  let applying = false;
  let selector = document.getElementById("languageSelect");
  const selectorWasPresent = Boolean(selector);

  function ensureSelector() {
    if (!selector) {
      selector = document.createElement("select");
      selector.id = "languageSelect";
      selector.className = "mth-universal-language-picker";
      (document.getElementById("siteLanguageSlot") || document.body).appendChild(selector);
    }
    selector.setAttribute("aria-label", "Select language");
    selector.querySelectorAll("option").forEach(option => {
      if (!languages[option.value]) option.remove();
    });
    Object.entries(languages).forEach(([code, metadata]) => {
      let option = selector.querySelector(`option[value="${code}"]`);
      if (!option) {
        option = document.createElement("option");
        option.value = code;
        selector.appendChild(option);
      }
      option.textContent = metadata.label;
    });
  }

  function translateFinanceExplanation(source, language) {
    if (language === "en") return source.replace(/^Untung = hasil − kos =/,"Profit = revenue − cost =").replace(/^Untung ÷ hasil × 100/,"Profit ÷ revenue × 100");
    return source.replace(/^Untung = hasil − kos =/,"利润 = 收入 − 成本 =").replace(/^Untung ÷ hasil × 100/,"利润 ÷ 收入 × 100").replace(/^I = P × R × T/,"单利 = 本金 × 利率 × 时间");
  }
  function translateGameDynamic(source, language) {
    if (language === "ms") return source;
    let m;
    if ((m=source.match(/^(\d+) hartanah$/))) return language === "en" ? `${m[1]} properties` : `${m[1]} 项地产`;
    if ((m=source.match(/^Milik P(\d+)$/))) return language === "en" ? `Owned by P${m[1]}` : `玩家 ${m[1]} 所有`;
    if ((m=source.match(/^Bayar (RM\d+)$/))) return language === "en" ? `Pay ${m[1]}` : `支付 ${m[1]}`;
    if ((m=source.match(/^Giliran (.+) — (tamatkan giliran|baling dadu)\.$/))) return language === "en" ? `${m[1]}'s turn — ${m[2]==="baling dadu"?"roll the dice":"end the turn"}.` : `${m[1]} 的回合——${m[2]==="baling dadu"?"掷骰子":"结束回合"}。`;
    if ((m=source.match(/^Harga (RM\d+)\. Sewa (RM\d+)\. Mahu beli\?$/))) return language === "en" ? `Price ${m[1]}. Rent ${m[2]}. Buy it?` : `价格 ${m[1]}，租金 ${m[2]}。是否购买？`;
    if ((m=source.match(/^(.+) bankrap\. (.+) menang!?$/))) return language === "en" ? `${m[1]} is bankrupt. ${m[2]} wins!` : `${m[1]} 破产，${m[2]} 获胜！`;
    if ((m=source.match(/^(.+) membayar sewa (RM\d+)\.$/))) return language === "en" ? `${m[1]} pays ${m[2]} rent.` : `${m[1]} 支付租金 ${m[2]}。`;
    if ((m=source.match(/^(.+) membeli (.+) pada (RM\d+)\.$/))) return language === "en" ? `${m[1]} buys ${m[2]} for ${m[3]}.` : `${m[1]} 以 ${m[3]} 购买 ${m[2]}。`;
    if ((m=source.match(/^(.+) melepasi MULA dan menerima (RM\d+)\.$/))) return language === "en" ? `${m[1]} passes START and receives ${m[2]}.` : `${m[1]} 经过起点并获得 ${m[2]}。`;
    if ((m=source.match(/^(.+) membaling (\d+) dan tiba di (.+)\.$/))) return language === "en" ? `${m[1]} rolls ${m[2]} and lands on ${m[3]}.` : `${m[1]} 掷出 ${m[2]}，到达 ${m[3]}。`;
    if ((m=source.match(/^(.+) dihantar ke Pusat Tahanan dan membayar (RM\d+)\.$/))) return language === "en" ? `${m[1]} is sent to Detention and pays ${m[2]}.` : `${m[1]} 被送往拘留中心并支付 ${m[2]}。`;
    if ((m=source.match(/^(.+) menerima bonus rehat (RM\d+)\.$/))) return language === "en" ? `${m[1]} receives a rest bonus of ${m[2]}.` : `${m[1]} 获得休息奖励 ${m[2]}。`;
    if ((m=source.match(/^(.+): (.+)$/)) && dictionaries[language]?.[m[2]]) return `${m[1]}: ${dictionaries[language][m[2]]}`;    if ((m=source.match(/^Baki huruf: (\d+)$/))) return language === "en" ? `Letters remaining: ${m[1]}` : `剩余字母：${m[1]}`;
    if ((m=source.match(/^Potensi pulangan (RM[\d,]+) · Risiko (\d+)%$/))) return language === "en" ? `Potential return ${m[1]} · Risk ${m[2]}%` : `潜在回报 ${m[1]} · 风险 ${m[2]}%`;
    if ((m=source.match(/^Modal (RM[\d,]+)$/))) return language === "en" ? `Capital ${m[1]}` : `本金 ${m[1]}`;
    if ((m=source.match(/^Kos (RM[\d,]+) dan hasil jualan (RM[\d,]+)\. Berapakah untung\?$/))) return language === "en" ? `Cost ${m[1]} and sales ${m[2]}. What is the profit?` : `成本 ${m[1]}，销售额 ${m[2]}。利润是多少？`;
    if ((m=source.match(/^Stok berharga (RM[\d,]+) mendapat diskaun (\d+)%\. Berapakah nilai diskaun\?$/))) return language === "en" ? `Stock costing ${m[1]} receives a ${m[2]}% discount. What is the discount?` : `价值 ${m[1]} 的库存享有 ${m[2]}% 折扣。折扣额是多少？`;
    if ((m=source.match(/^Jualan (RM[\d,]+) meningkat (\d+)%\. Berapakah nilai peningkatan\?$/))) return language === "en" ? `Sales of ${m[1]} increase by ${m[2]}%. What is the increase?` : `${m[1]} 的销售额增长 ${m[2]}%。增长额是多少？`;
    if ((m=source.match(/^Simpan (RM[\d,]+) pada (\d+)% setahun selama (\d+) tahun\. Berapakah faedah mudah\?$/))) return language === "en" ? `Save ${m[1]} at ${m[2]}% per year for ${m[3]} year(s). What is the simple interest?` : `将 ${m[1]} 以年利率 ${m[2]}% 存 ${m[3]} 年。单利是多少？`;
    if ((m=source.match(/^Hasil (RM[\d,]+) dengan kos (RM[\d,]+)\. Berapakah margin untung sebagai peratus hasil\?$/))) return language === "en" ? `Revenue ${m[1]} with cost ${m[2]}. What is the profit margin as a percentage of revenue?` : `收入 ${m[1]}，成本 ${m[2]}。利润占收入的百分比是多少？`;
    if ((m=source.match(/^Nilai aset (RM[\d,]+) berkembang (\d+)%\. Berapakah nilai baharu\?$/))) return language === "en" ? `An asset worth ${m[1]} grows by ${m[2]}%. What is its new value?` : `价值 ${m[1]} 的资产增长 ${m[2]}%。新价值是多少？`;
    if ((m=source.match(/^Tepat! (.*) Perniagaan membayar (RM[\d,]+)\.$/))) return language === "en" ? `Correct! ${translateFinanceExplanation(m[1],language)} The business paid ${m[2]}.` : `答对了！${translateFinanceExplanation(m[1],language)} 企业获得 ${m[2]}。`;
    if ((m=source.match(/^Jawapan: (RM[\d,]+)\. (.*) Risiko meningkat\.$/))) return language === "en" ? `Answer: ${m[1]}. ${translateFinanceExplanation(m[2],language)} Risk increased.` : `答案：${m[1]}。${translateFinanceExplanation(m[2],language)} 风险上升。`;
    if ((m=source.match(/^Bulan (\d+): (.+) — (Untung|Rugi) (RM[\d,]+)(.*)$/))) return language === "en" ? `Month ${m[1]}: ${translateTemplate(m[2],language)} — ${m[3]==="Untung"?"Profit":"Loss"} ${m[4]}${m[5].replace("jawapan tepat","correct answer").replace("jawapan salah","wrong answer")}` : `第 ${m[1]} 月：${translateTemplate(m[2],language)} — ${m[3]==="Untung"?"盈利":"亏损"} ${m[4]}${m[5].replace("jawapan tepat","答对").replace("jawapan salah","答错")}`;
    if ((m=source.match(/^Nilai bersih akhir: (RM[\d,]+)\. (.*)$/))) return language === "en" ? `Final net worth: ${m[1]}. ${m[2].startsWith("Strategi")?"Your strategy, calculations, and risk management reached the target!":"Try again: diversify investments, protect your capital, and check every calculation."}` : `最终净资产：${m[1]}。${m[2].startsWith("Strategi")?"你的策略、计算和风险管理成功达成目标！":"再试一次：分散投资、保护本金并检查每项计算。"}`;    if ((m=source.match(/^(.+): \+(\d+) markah\.$/))) return language === "en" ? `${m[1]}: +${m[2]} points.` : `${m[1]}：+${m[2]} 分。`;
    if ((m=source.match(/^You finished (\w+) of 8 in (.+)\. (.*)$/))) return language === "ms" ? `Anda tamat di tempat ${m[1]} daripada 8 dalam ${m[2]}. ${m[3].startsWith("A superb")?"Pemanduan hebat—trofi 3D milik anda!":"Cuba garisan perlumbaan yang lebih lancar dan cabar pendahulu lagi."}` : language === "zh" ? `你以第 ${m[1]} 名完成比赛，用时 ${m[2]}。${m[3].startsWith("A superb")?"精彩驾驶——3D 奖杯属于你！":"尝试更平顺的赛车路线，再次挑战领先者。"}` : source;
    return source;
  }
  function translateTemplate(source, language) {
    const dictionary = dictionaries[language];
    if (!dictionary) return source;
    if (dictionary[source]) return dictionary[source];
    let match = source.match(/^Year\s+(\d+)(.*)$/i);
    if (match) return `${dictionary.Year} ${match[1]}${match[2]}`;
    match = source.match(/^Form\s+(\d+)(.*)$/i);
    if (match) return `${dictionary.Form} ${match[1]}${match[2]}`;
    match = source.match(/^(\d+)\s+activities$/i);
    if (match) return `${match[1]} ${dictionary.Activities.toLocaleLowerCase(languages[language].locale)}`;
    match = source.match(/^Showing all\s+(\d+)\s+activities$/i);
    if (match) {
      const prefixes = { id:"Menampilkan semua", ar:"عرض جميع", fr:"Affichage des", es:"Mostrando las", ko:"전체 표시", ja:"全件表示", it:"Visualizzazione di", pt:"A mostrar", ms:"Menunjukkan semua" };
      return `${prefixes[language]} ${match[1]} ${dictionary.Activities.toLocaleLowerCase(languages[language].locale)}`;
    }
    return translateGameDynamic(source, language);
  }

  function translateText(source, language) {
    const clean = source.trim();
    if (!clean) return clean;
    return translateTemplate(clean, language);
  }

  function translateNode(node, language) {
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    const source = originals.get(node);
    const clean = source.trim();
    node.nodeValue = clean ? source.replace(clean, translateText(clean, language)) : source;
  }

  function translateAttributes(element, language) {
    const names = ["placeholder", "title", "aria-label", "data-empty-message"];
    if (!originalAttributes.has(element)) originalAttributes.set(element, {});
    const stored = originalAttributes.get(element);
    names.forEach(name => {
      if (!element.hasAttribute(name)) return;
      if (!(name in stored)) stored[name] = element.getAttribute(name);
      element.setAttribute(name, translateText(stored[name], language));
    });
  }

  function translateSubtree(root, language) {
    if (root.nodeType === Node.TEXT_NODE) {
      translateNode(root, language);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.matches("script,style,select,option,textarea,code,pre,canvas,svg")) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("script,style,select,option,textarea,code,pre,canvas,svg,[data-no-translate]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => translateNode(node, language));
    if (root.matches("[placeholder],[title],[aria-label],[data-empty-message]")) translateAttributes(root, language);
    root.querySelectorAll("[placeholder],[title],[aria-label],[data-empty-message]").forEach(element => translateAttributes(element, language));
  }

  function apply(language, announce = true) {
    const selected = languages[language] ? language : "en";
    applying = true;
    document.documentElement.lang = languages[selected].locale;
    document.documentElement.dir = languages[selected].dir;
    document.documentElement.classList.toggle("mth-rtl", selected === "ar");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest("script,style,select,option,textarea,code,pre,canvas,svg,[data-no-translate]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => translateNode(node, selected));
    document.querySelectorAll("[placeholder],[title],[aria-label],[data-empty-message]").forEach(element => translateAttributes(element, selected));
    selector.value = selected;
    selector.setAttribute("aria-label", dictionaries[selected]?.["Select language"] || "Select language");
    localStorage.setItem(STORAGE_KEY, selected);
    window.siteLocale = languages[selected].locale;
    applying = false;
    if (announce) document.dispatchEvent(new CustomEvent("siteLanguageChanged", { detail: { language: selected, locale: languages[selected].locale } }));
  }

  const style = document.createElement("style");
  style.textContent = `
    .mth-universal-language-picker{position:fixed;top:14px;right:14px;z-index:10020;min-height:40px;max-width:190px;padding:0 32px 0 11px;border:1px solid #94a3b8;border-radius:9px;color:#172033;background:#fff;box-shadow:0 8px 24px #0f172a2e;font:700 .78rem "Segoe UI",Arial,sans-serif;cursor:pointer}
    .site-language-slot .mth-universal-language-picker,.site-language-slot #languageSelect{position:static;box-shadow:none}
    .mth-universal-language-picker:focus{outline:3px solid #93c5fd;outline-offset:2px}
    html.mth-rtl body{text-align:start}html.mth-rtl canvas,html.mth-rtl svg,html.mth-rtl .game-board,html.mth-rtl [data-direction="ltr"]{direction:ltr}
    html.mth-learning-page{scroll-behavior:auto!important;overflow-y:auto!important}html.mth-learning-page body{overflow-y:auto!important;touch-action:pan-y}
    @media(max-width:560px){.mth-universal-language-picker,body>.site-language-picker{top:auto;right:auto;left:12px;bottom:12px;max-width:155px}.site-language-slot .mth-universal-language-picker,.site-language-slot #languageSelect{max-width:145px}}
  `;
  document.head.appendChild(style);
  function setupSmartphoneGameView() {
    if (!location.pathname.includes("/games/")) return;

    document.documentElement.classList.add("mth-game-page");
    const phoneStyle = document.createElement("style");
    phoneStyle.textContent = `
      .mth-landscape-prompt{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;padding:24px;background:#0f172af2;color:#fff;text-align:center;font-family:"Segoe UI",Arial,sans-serif}
      .mth-landscape-prompt[hidden]{display:none!important}.mth-landscape-card{width:min(92vw,420px);padding:24px;border:1px solid #ffffff30;border-radius:20px;background:#172033;box-shadow:0 24px 70px #0008}
      .mth-landscape-icon{display:block;font-size:3rem;line-height:1;transform:rotate(90deg);margin-bottom:12px}.mth-landscape-card h2{margin:0 0 8px;font-size:1.35rem}.mth-landscape-card p{margin:0 0 18px;line-height:1.45}
      .mth-landscape-card button{min-width:180px;min-height:48px;border:0;border-radius:12px;background:#facc15;color:#172033;font:800 1rem "Segoe UI",Arial,sans-serif;cursor:pointer}
      @media (orientation:landscape) and (max-height:600px) and (pointer:coarse){html.mth-game-page{font-size:12px!important}html.mth-game-page body{font-size:.82rem}html.mth-game-page :is(header,.header,.topbar){padding-top:5px!important;padding-bottom:5px!important}html.mth-game-page :is(button,input,select){font-size:.78rem!important}html.mth-game-page :is(h1,.title){font-size:clamp(1rem,3vw,1.55rem)!important}html.mth-game-page :is(h2,h3){margin-block:.25em!important}}
    `;
    document.head.appendChild(phoneStyle);

    const prompt = document.createElement("div");
    prompt.className = "mth-landscape-prompt";
    prompt.setAttribute("role", "dialog");
    prompt.setAttribute("aria-modal", "true");
    prompt.innerHTML = '<div class="mth-landscape-card"><span class="mth-landscape-icon" aria-hidden="true">📱</span><h2>Landscape game view</h2><p>Tap below, then turn your phone sideways. The game will fit into one screen.</p><button type="button">Open landscape view</button></div>';
    document.body.appendChild(prompt);
    const promptCopy = {
      en: ["Landscape game view", "Tap below, then turn your phone sideways. The game will fit into one screen.", "Open landscape view", "Please turn your phone sideways. The game will fit automatically."],
      ms: ["Paparan permainan landskap", "Tekan di bawah, kemudian pusing telefon anda secara mendatar. Permainan akan muat dalam satu skrin.", "Buka paparan landskap", "Sila pusing telefon anda secara mendatar. Permainan akan dimuatkan secara automatik."],
      zh: ["\u6a2a\u5c4f\u6e38\u620f\u89c6\u56fe", "\u70b9\u51fb\u4e0b\u65b9\u6309\u94ae\uff0c\u7136\u540e\u5c06\u624b\u673a\u6a2a\u653e\u3002\u6e38\u620f\u5c06\u81ea\u52a8\u9002\u5e94\u5355\u4e2a\u5c4f\u5e55\u3002", "\u6253\u5f00\u6a2a\u5c4f\u89c6\u56fe", "\u8bf7\u5c06\u624b\u673a\u6a2a\u653e\uff0c\u6e38\u620f\u5c06\u81ea\u52a8\u9002\u5e94\u3002"]
    };
    const updatePromptLanguage = language => {
      const copy = promptCopy[language] || promptCopy.en;
      prompt.querySelector("h2").textContent = copy[0];
      prompt.querySelector("p").textContent = copy[1];
      prompt.querySelector("button").textContent = copy[2];
    };
    updatePromptLanguage(new URLSearchParams(location.search).get("lang") || localStorage.getItem(STORAGE_KEY) || "en");

    let fitting = false;
    const isPhone = () => matchMedia("(pointer:coarse)").matches && Math.min(screen.width, screen.height) <= 600;
    const clearFit = () => {
      document.body.style.zoom = "";
      document.body.style.width = "";
      document.body.style.minHeight = "";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
    const fit = () => {
      if (fitting) return;
      fitting = true;
      clearFit();
      const phone = isPhone();
      const portrait = innerHeight > innerWidth;
      prompt.hidden = !phone || !portrait;
      if (phone && !portrait) {
        const naturalWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, innerWidth);
        const naturalHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, innerHeight);
        const scale = Math.min(1, innerWidth / naturalWidth, innerHeight / naturalHeight);
        document.body.style.zoom = String(scale);
        document.body.style.width = `${100 / scale}%`;
        document.body.style.minHeight = `${innerHeight / scale}px`;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      }
      fitting = false;
    };
    prompt.querySelector("button").addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        if (screen.orientation?.lock) await screen.orientation.lock("landscape");
      } catch (_) {
        const language = new URLSearchParams(location.search).get("lang") || localStorage.getItem(STORAGE_KEY) || "en";
        prompt.querySelector("p").textContent = (promptCopy[language] || promptCopy.en)[3];
      }
      setTimeout(fit, 250);
    });
    addEventListener("resize", fit);
    addEventListener("orientationchange", () => setTimeout(fit, 250));
    addEventListener("load", fit, { once: true });
    document.addEventListener("siteLanguageChanged", event => { updatePromptLanguage(event.detail.language); setTimeout(fit, 120); });
    fit();
    setTimeout(fit, 500);
  }
  setupSmartphoneGameView();
  ensureSelector();

  document.addEventListener("change", event => {
    if (event.target !== selector || !event.isTrusted) return;
    const selected = selector.value;
    if (selectorWasPresent) {
      event.stopImmediatePropagation();
      localStorage.setItem(STORAGE_KEY, selected);
      const nextUrl = new URL(location.href);
      if (["en", "ms", "zh"].includes(selected)) nextUrl.searchParams.delete("lang");
      else nextUrl.searchParams.set("lang", selected);
      location.replace(nextUrl.href);
      return;
    }
    event.stopImmediatePropagation();
    apply(selected);
  }, true);

  let translationTimer = 0;
  const pendingTranslationRoots = new Set();
  const observer = new MutationObserver(mutations => {
    if (applying) return;
    const selected = localStorage.getItem(STORAGE_KEY) || "en";

    mutations.forEach(mutation => mutation.addedNodes.forEach(node => pendingTranslationRoots.add(node)));
    clearTimeout(translationTimer);
    translationTimer = setTimeout(() => {
      const current = localStorage.getItem(STORAGE_KEY) || "en";
      if (!languages[current]) {
        pendingTranslationRoots.clear();
        return;
      }
      applying = true;
      [...pendingTranslationRoots].forEach(root => {
        if (root.isConnected || root.nodeType === Node.TEXT_NODE && root.parentNode?.isConnected) translateSubtree(root, current);
      });
      pendingTranslationRoots.clear();
      applying = false;
    }, 80);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const requestedLanguage = new URLSearchParams(location.search).get("lang");
  apply(languages[requestedLanguage] ? requestedLanguage : (localStorage.getItem(STORAGE_KEY) || "en"), false);
  window.MathToolsHubLanguage = Object.freeze({ languages, apply, current: () => selector.value });
})();
