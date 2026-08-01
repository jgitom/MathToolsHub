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
    return source;
  }

  function translateText(source, language) {
    const clean = source.trim();
    if (!clean || language === "en") return clean;
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
  ensureSelector();

  document.addEventListener("change", event => {
    if (event.target !== selector) return;
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
    if (selected === "en") return;
    mutations.forEach(mutation => mutation.addedNodes.forEach(node => pendingTranslationRoots.add(node)));
    clearTimeout(translationTimer);
    translationTimer = setTimeout(() => {
      const current = localStorage.getItem(STORAGE_KEY) || "en";
      if (!languages[current] || current === "en") {
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
