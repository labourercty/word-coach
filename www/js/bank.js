/* bank.js — hand-written question material (grammar, reading, context, math, pictures) */
(function (G) {
  'use strict';
  var WC = G.WC = G.WC || {};
  var B = WC.BANK = {};
  var rows = function (s) { var a = Array.isArray(s) ? s : String(s).trim().split('\n'); return a.map(function (x) { return String(x).trim(); }).filter(Boolean); };

  /* irregular + common verbs: base | past | past participle | he/she form | object phrase */
  B.verbs = rows([
    'go|went|gone|goes|to the market', 'see|saw|seen|sees|a rainbow', 'eat|ate|eaten|eats|an apple', 'take|took|taken|takes|a photo',
    'give|gave|given|gives|a gift', 'write|wrote|written|writes|a letter', 'speak|spoke|spoken|speaks|to the class', 'break|broke|broken|breaks|a glass',
    'choose|chose|chosen|chooses|a book', 'drive|drove|driven|drives|to the city', 'ride|rode|ridden|rides|a horse', 'rise|rose|risen|rises|early',
    'fall|fell|fallen|falls|down the stairs', 'fly|flew|flown|flies|to Delhi', 'grow|grew|grown|grows|tomatoes', 'know|knew|known|knows|the answer',
    'throw|threw|thrown|throws|a ball', 'draw|drew|drawn|draws|a picture', 'swim|swam|swum|swims|across the lake', 'sing|sang|sung|sings|a song',
    'drink|drank|drunk|drinks|some milk', 'begin|began|begun|begins|the lesson', 'run|ran|run|runs|in the park', 'come|came|come|comes|to our house',
    'become|became|become|becomes|a doctor', 'do|did|done|does|her homework', 'make|made|made|makes|a cake', 'tell|told|told|tells|a story',
    'buy|bought|bought|buys|a new bag', 'bring|brought|brought|brings|her lunch', 'think|thought|thought|thinks|about it', 'catch|caught|caught|catches|the bus',
    'teach|taught|taught|teaches|math', 'find|found|found|finds|a coin', 'get|got|got|gets|a prize', 'hold|held|held|holds|my hand',
    'keep|kept|kept|keeps|a diary', 'leave|left|left|leaves|early', 'lose|lost|lost|loses|her keys', 'meet|met|met|meets|a friend',
    'pay|paid|paid|pays|the bill', 'sell|sold|sold|sells|old books', 'send|sent|sent|sends|a message', 'sit|sat|sat|sits|on the bench',
    'sleep|slept|slept|sleeps|for ten hours', 'stand|stood|stood|stands|in line', 'win|won|won|wins|the race', 'wear|wore|worn|wears|a red coat',
    'steal|stole|stolen|steals|the show', 'forget|forgot|forgotten|forgets|his umbrella', 'hide|hid|hidden|hides|the present', 'shake|shook|shaken|shakes|the bottle',
    'wake|woke|woken|wakes|the baby', 'blow|blew|blown|blows|out the candles', 'build|built|built|builds|a sandcastle', 'read|read|read|reads|a comic',
    'feel|felt|felt|feels|very happy', 'lead|led|led|leads|the team', 'spend|spent|spent|spends|her savings', 'understand|understood|understood|understands|the rule'
  ]).map(function (r) { var p = r.split('|'); return { b: p[0], p: p[1], pp: p[2], s: p[3], o: p[4] }; });

  B.subjects = [['I', 'I'], ['She', 's'], ['He', 's'], ['We', 'we'], ['They', 'we'], ['My brother', 's'], ['The teacher', 's'], ['Our neighbors', 'we'], ['The children', 'we'], ['My mother', 's'], ['The old man', 's'], ['You', 'we']];
  B.times = ['Yesterday', 'Last week', 'Last night', 'Two days ago', 'Last summer', 'Last month', 'This morning'];

  /* sentence | correct | wrong */
  B.preps = rows([
    'My birthday is ___ July.|in|on', 'The meeting is ___ Monday.|on|in', 'School starts ___ 8 o\'clock.|at|in', 'We go to the beach ___ summer.|in|at',
    'The cat is hiding ___ the bed.|under|between', 'He walked ___ the bridge to reach the town.|across|among', 'She was born ___ 2012.|in|on', 'See you ___ the weekend!|at|on',
    'The picture is hanging ___ the wall.|on|at', 'I will call you ___ lunch.|after|since', 'Sit ___ me and tell me a story.|beside|besides', 'The bird flew ___ the clouds.|above|among',
    'We have lived here ___ 2019.|since|for', 'We have lived here ___ five years.|for|since', 'He is good ___ chess.|at|in', 'She is afraid ___ spiders.|of|from',
    'I am interested ___ music.|in|on', 'They arrived ___ the airport early.|at|to', 'The book is ___ the table.|on|in', 'He jumped ___ the pool.|into|onto',
    'The train leaves ___ platform 4.|from|at', 'I have been waiting ___ an hour.|for|since', 'She divided the cake ___ four friends.|among|between', 'The path goes ___ the forest.|through|across',
    'We stayed ___ a hotel near the sea.|in|at', 'Please write your name ___ the top of the page.|at|on', 'He was angry ___ his brother.|with|to', 'This gift is ___ you.|for|to',
    'The shop closes ___ midnight.|at|on', 'My cousin lives ___ Mumbai.|in|on', 'We danced ___ the music.|to|at', 'A bird sat ___ the branch above us.|on|at',
    'He hid ___ the curtain.|behind|between', 'She split the prize ___ her two sisters.|between|among', 'The river flows ___ the village.|past|beside by', 'I will finish ___ Friday.|by|until',
    'The store is open ___ nine ___ five.|from|since', 'The dog ran ___ the stairs.|down|on', 'I am proud ___ my team.|of|for', 'Don\'t shout ___ the baby.|at|on'
  ]).map(function (r) { var p = r.split('|'); return { s: p[0], c: p[1], w: p[2].split(' ')[0] }; });

  B.prons = rows([
    'Tom and I love pizza. ___ eat it daily.|We|Us', 'Give the book to ___.|her|she', '___ is my best friend.|She|Her', 'The dog wagged ___ tail.|its|it\'s',
    'Those books are ___.|mine|me', 'Please help ___ with this box.|me|I', 'My sister and ___ went shopping.|I|me', 'The teacher thanked ___ for the gift.|us|we',
    'This pencil belongs to ___.|him|he', '___ are coming to the party tonight.|They|Them', 'The prize is ___, not yours.|hers|her', 'Is this seat ___?|yours|you',
    'He hurt ___ while playing football.|himself|hisself', 'They built the house ___.|themselves|theirselves', 'The girl lost ___ umbrella.|her|she', 'Call ___ when you arrive.|me|my',
    'Sam gave ___ a present.|us|we', 'You and ___ can sit here.|he|him', 'The cake looks great. Who made ___?|it|its', 'I saw ___ at the market yesterday.|them|they',
    'The bag is not ___; it is hers.|his|he', 'Neither of the boys brought ___ lunch.|his|their', 'We cleaned ___ room together.|our|us', 'It was ___ who called you.|he|him'
  ]).map(function (r) { var p = r.split('|'); return { s: p[0], c: p[1], w: p[2] }; });

  B.plurals = rows([
    'child|children|childs', 'man|men|mans', 'woman|women|womans', 'foot|feet|foots', 'tooth|teeth|tooths', 'mouse|mice|mouses', 'goose|geese|gooses', 'person|people|persons',
    'leaf|leaves|leafs', 'knife|knives|knifes', 'wolf|wolves|wolfs', 'life|lives|lifes', 'shelf|shelves|shelfs', 'city|cities|citys', 'baby|babies|babys', 'box|boxes|boxs',
    'bus|buses|buss', 'church|churches|churchs', 'dish|dishes|dishs', 'watch|watches|watchs', 'story|stories|storys', 'family|families|familys', 'fox|foxes|foxs', 'wish|wishes|wishs',
    'hero|heroes|heroos', 'potato|potatoes|potatos', 'tomato|tomatoes|tomatos', 'sheep|sheep|sheeps', 'fish|fish|fishes', 'deer|deer|deers', 'berry|berries|berrys', 'party|parties|partys',
    'butterfly|butterflies|butterflys', 'lady|ladies|ladys', 'loaf|loaves|loafs', 'half|halves|halfs', 'thief|thieves|thiefs', 'scarf|scarves|scarfs', 'penny|pennies|pennys', 'glass|glasses|glasss'
  ]).map(function (r) { var p = r.split('|'); return { s: p[0], c: p[1], w: p[2] }; });

  B.comps = rows([
    'big|bigger|more big|biggest', 'small|smaller|more small|smallest', 'happy|happier|more happy|happiest', 'good|better|gooder|best', 'bad|worse|badder|worst',
    'tall|taller|more tall|tallest', 'hot|hotter|more hot|hottest', 'easy|easier|more easy|easiest', 'far|farther|more far|farthest', 'little|less|littler|least',
    'many|more|manyer|most', 'fast|faster|more fast|fastest', 'funny|funnier|more funny|funniest', 'thin|thinner|more thin|thinnest', 'heavy|heavier|more heavy|heaviest',
    'busy|busier|more busy|busiest', 'long|longer|more long|longest', 'young|younger|more young|youngest', 'old|older|more old|oldest', 'sad|sadder|more sad|saddest'
  ]).map(function (r) { var p = r.split('|'); return { a: p[0], c: p[1], w: p[2], sc: p[3] }; });

  B.homos = rows([
    'I left my bag over ___.|there|their', 'The students forgot ___ homework.|their|there', '___ going to be late.|They\'re|There', 'Can I have ___ cookie, too?|a|an',
    'It is ___ late to start now.|too|to', 'She wants ___ go home.|to|too', 'He has ___ brothers.|two|too', 'Is this ___ umbrella?|your|you\'re',
    '___ welcome to join us.|You\'re|Your', 'Can you ___ the music from here?|hear|here', 'Come ___ and look at this.|here|hear', 'Please ___ your name on the form.|write|right',
    'Turn ___ at the next corner.|right|write', 'I do not ___ the answer.|know|no', 'There is ___ milk left.|no|know', 'We swam in the ___.|sea|see',
    'Can you ___ the bird on the roof?|see|sea', 'I wonder ___ it will rain today.|whether|weather', 'The ___ is sunny today.|weather|whether', 'She ate a ___ of pizza.|piece|peace',
    'We hope for world ___.|peace|piece', 'The ___ of the story was sad.|end|and', 'He ___ a letter to his friend.|wrote|rote', 'The bell ___ loudly.|rang|wrang',
    'The cat chased ___ tail.|its|it\'s', '___ raining outside.|It\'s|Its', 'I ___ my homework last night.|did|done', 'She has ___ her best.|done|did',
    'We ___ to the zoo last Sunday.|went|gone', 'They have ___ home already.|gone|went', 'The sun ___ in the east.|rises|raises', 'Please ___ your hand if you know.|raise|rise'
  ]).map(function (r) { var p = r.split('|'); return { s: p[0], c: p[1], w: p[2] }; });

  /* fill-in sentences: sentence | answer | wrong word | tier */
  B.cloze = rows([
    'The soup is too ___ to eat right now.|hot|empty|1', 'She was so ___ after the long run that she fell asleep.|tired|loud|1', 'Please be ___ in the library.|quiet|angry|1',
    'He felt ___ when his toy broke.|sad|round|1', 'The ___ elephant walked slowly through the forest.|huge|early|1', 'We will ___ the game at noon.|begin|beautiful|1',
    'My grandfather is very ___; he is ninety years old.|old|young|1', 'She is ___ because she always shares her toys.|kind|rude|1', 'The box was so ___ that I could not lift it.|heavy|light|1',
    'We were ___ to see the rain stop.|glad|sharp|1', 'He ran ___ to catch the bus.|quickly|quick|1', 'The ___ cat curled up on the sofa and slept.|sleepy|angrily|1',
    'A ___ rabbit hopped across the garden.|tiny|quickly|1', 'The baby smiled and gave a ___ giggle.|happy|dirty|1', 'Don\'t be ___ of the dark; I am here with you.|scared|brave|1',
    'It is ___ outside, so put on your coat.|cold|warm|1', 'The sky was ___ and the stars were shining.|dark|bright|1', 'The sand felt ___ under our feet.|warm|noisy|1',
    'The explorer was ___ about the strange cave.|curious|obvious|2', 'The ___ waves crashed against the rocks.|enormous|tidy|2', 'The old castle looked ___ in the fog.|gloomy|cheerful|2',
    'A ___ cat jumped onto the shelf without a sound.|graceful|clumsy|2', 'He was ___ and shared his lunch with everyone.|generous|selfish|2', 'This vase is ___, so handle it with care.|fragile|sturdy|2',
    'She felt ___ to receive so many gifts.|grateful|angry|2', 'The mountain air was ___ and clean.|crisp|crowded|2', 'He tried to ___ the secret, but his face gave it away.|conceal|reveal|2',
    'The teacher asked us to ___ our answers carefully.|examine|escape|2', 'The ___ road made the journey slow and tiring.|narrow|wide|2', 'The ___ pirate hid the treasure on a distant island.|cunning|innocent|2',
    'There was ___ food at the feast, enough for everyone.|plenty of|little|2', 'He gave a ___ speech that made everyone cheer.|brilliant|dull|2', 'The ___ crowd pushed toward the stage.|eager|reluctant|2',
    'After the storm, the beach was ___ with seaweed and shells.|scattered|polished|2', 'We could not ___ the noise from the street.|ignore|invent|2', 'The detective began to ___ the strange footprints.|inspect|chew|2',
    'She spoke in a ___ voice so she would not wake the baby.|gentle|loud|2', 'It would be ___ to travel to the moon without a rocket.|impossible|possible|3',
    'The scientist made a ___ discovery that changed medicine.|remarkable|ordinary|3', 'Her ___ answer showed she had not studied.|vague|precise|3', 'He is so ___ that he never gives up.|persistent|lazy|3',
    'The ___ of the village welcomed the visitors warmly.|inhabitants|enemies|3', 'The ___ forest was home to hundreds of animals.|dense|barren|3', 'A ___ person always tells the truth.|candid|deceitful|3',
    'The judge was ___ and listened to both sides.|impartial|biased|3', 'Because of the ___ weather, the flight was delayed.|severe|mild|3', 'The company hoped to ___ its profits this year.|increase|reduce|3',
    'He made a ___ effort to finish the race.|determined|careless|3', 'The soldiers showed great ___ in the battle.|courage|fear|3', 'We need to ___ the problem before it gets worse.|resolve|create|3',
    'Her ___ remarks hurt his feelings.|harsh|gentle|3', 'The ___ lecture put half the audience to sleep.|tedious|thrilling|3', 'Sam is ___; he never wastes a single rupee.|frugal|lavish|3',
    'The ___ mist hid the mountains from view.|dense|clear|3', 'The mayor tried to ___ the angry crowd.|pacify|provoke|4', 'His ___ remarks about the project made everyone nervous.|ominous|cheerful|4',
    'She was ___ in her search for the missing key and checked every room.|meticulous|careless|4', 'The ___ of the ancient manuscript was never proven.|authenticity|absurdity|4',
    'The ___ clerk answered every question patiently.|courteous|rude|4', 'They tried to ___ the dispute without going to court.|mediate|inflame|4', 'He was ___ about the offer and asked for more time.|skeptical|gullible|4',
    'The ___ student asked questions about everything.|inquisitive|indifferent|4', 'Her ___ nature made her popular with everyone.|affable|surly|4', 'The new law will ___ small shops from high taxes.|exempt|burden|4',
    'The old bridge was too ___ to carry heavy trucks.|fragile|robust|4', 'The ___ comedian made the audience laugh until they cried.|witty|dreary|4', 'It was a ___ gesture, quietly helping a stranger.|selfless|selfish|4',
    'The ___ smell of smoke filled the room.|pungent|fragrant|4', 'The senator\'s ___ speech lasted for three hours.|verbose|concise|5', 'His ___ attitude made him unwilling to listen to advice.|obstinate|flexible|5',
    'The ___ villagers lived simply and wasted nothing.|frugal|extravagant|5', 'She gave a ___ reply that avoided the question.|evasive|direct|5', 'The ___ ruler was feared by all his people.|tyrannical|benevolent|5',
    'The sudden news left her ___ and speechless.|dumbfounded|elated|5', 'He had a ___ for collecting rare stamps.|penchant|dislike|5', 'The ___ guard watched every corner of the vault.|vigilant|careless|5',
    'The ___ nature of fashion means styles change every season.|ephemeral|permanent|5', 'The professor\'s ___ lectures were full of hidden meaning.|abstruse|simple|5', 'Her ___ spirit survived every hardship.|indomitable|fragile|5',
    'The ___ heat of the desert made the travelers weary.|oppressive|refreshing|5', 'He was ___ about his achievements and never bragged.|modest|boastful|5',
    'The poem\'s ___ imagery left readers puzzled.|enigmatic|obvious|6', 'The king\'s ___ ministers whispered behind his back.|obsequious|honest|6', 'A ___ breeze drifted over the quiet lake.|gentle|raucous|6',
    'The ___ lecture left the students dozing in their seats.|soporific|stimulating|6', 'The author\'s ___ prose was a joy to read.|mellifluous|strident|6', 'Her ___ demeanor calmed everyone in the room.|serene|volatile|6',
    'The ___ detective noticed what everyone else had missed.|perspicacious|oblivious|6', 'The ___ miser refused to spend even a coin.|parsimonious|generous|6', 'The speaker\'s ___ tone annoyed the whole audience.|supercilious|humble|6'
  ]).map(function (r) { var p = r.split('|'); return { s: p[0], c: p[1], w: p[2], t: +p[3] }; });

  /* short reading passages: text | question | right | wrong | tier */
  B.reading = rows([
    'Mia planted a seed and watered it daily. After two weeks, a tiny green sprout appeared.|What appeared after two weeks?|A green sprout|A red flower|1',
    'Sam missed the bus, so he walked to school and arrived late.|Why was Sam late?|He missed the bus|He woke up early|1',
    'The library is quiet because people are reading and studying.|Why is the library quiet?|People are reading|It is closed|1',
    'Leo saved coins in a jar for a month and bought a kite.|What did Leo buy?|A kite|A jar|1',
    'Dark clouds gathered and thunder rumbled, so we ran inside.|Why did they run inside?|A storm was coming|They were hungry|1',
    'Ana practiced piano every evening, and her playing improved a lot.|What happened to Ana\'s playing?|It improved|It got worse|1',
    'The desert is dry, with very little rain all year.|What is the desert like?|Dry|Wet|1',
    'Owls hunt at night and sleep during the day.|When do owls hunt?|At night|In the morning|1',
    'Ravi forgot his umbrella, so he got wet walking home in the rain.|Why did Ravi get wet?|He had no umbrella|He went swimming|1',
    'Bees visit flowers to collect nectar, which they turn into honey.|What do bees turn nectar into?|Honey|Milk|1',
    'The farmer woke before sunrise to feed the animals and milk the cows.|What did the farmer do first?|Fed the animals|Went to sleep|1',
    'Nina was nervous before her speech, but the kind smiles of her classmates helped her relax.|What helped Nina relax?|Her classmates\' smiles|A long nap|2',
    'The lighthouse keeper climbed 200 steps each evening to light the great lamp that guided ships safely past the rocks.|Why was the lamp lit?|To guide ships past the rocks|To warm the keeper|2',
    'After weeks of drought, the villagers were thrilled when heavy rain finally filled the dry well.|How did the villagers feel about the rain?|Thrilled|Annoyed|2',
    'Although the puzzle looked impossible, Dev kept trying different pieces until the picture slowly came together.|What did Dev do?|He kept trying|He gave up|2',
    'The museum guide asked everyone to stay behind the rope so the fragile statue would not be damaged.|Why stay behind the rope?|To protect the statue|To see better|2',
    'Penguins huddle together in the freezing wind, taking turns to stand on the cold outer edge of the group.|Why do penguins huddle?|To stay warm|To play games|2',
    'The explorer studied her map carefully, then chose the narrow path that led through the forest toward the river.|Which way did she go?|Through the forest|Over the mountain|2',
    'Maya felt proud when her little brother read his first whole book aloud without any help.|Why was Maya proud?|Her brother read a book alone|She won a race|2',
    'Because the bakery used fresh ingredients and a secret recipe, customers lined up before it even opened.|Why did customers line up?|The bread was excellent|The shop was free|2',
    'The scientist recorded the temperature every hour. By the end of the week, she noticed that the coldest time was always just before dawn.|When was it coldest?|Just before dawn|At noon|3',
    'Though the debate was heated, the moderator remained calm, allowing each side to finish before the next began.|How did the moderator behave?|Calmly and fairly|Angrily|3',
    'The ancient road, built by hand, still survives because its builders chose durable stones and carefully planned the drainage.|Why has the road survived?|It was built carefully|It is new|3',
    'Few people noticed the small leak at first, but over time the damage spread through the walls and floors.|What happened to the leak?|The damage slowly spread|It fixed itself|3',
    'The new library encourages quiet reading, yet it also has a lively corner where children can act out stories.|What is special about the corner?|Children can act out stories|It is completely silent|3',
    'Her brother was reluctant to try the unfamiliar dish, but after a single bite he asked for more.|How did he feel after one bite?|He liked it|He disliked it|3',
    'Anyone can learn a language, though progress is rarely quick; steady daily practice matters more than occasional long sessions.|What matters most?|Steady daily practice|Long rare sessions|3',
    'The mayor\'s plan was ambitious, requiring both new funding and the cooperation of every neighborhood.|What did the plan require?|Funding and cooperation|Only a vote|4',
    'Contrary to popular belief, bats are not blind; many species see well and also use echolocation to navigate in darkness.|What is the popular belief?|Bats are blind|Bats are huge|4',
    'The explorer\'s journal, though faded, offered a meticulous account of the expedition, noting weather, distances, and even the moods of the crew.|What does meticulous suggest about the journal?|It was very detailed|It was careless|4',
    'Innovation rarely appears from nowhere; it usually builds on many small ideas that others have already tested.|What does innovation usually build on?|Earlier small ideas|Pure luck|4',
    'The committee deliberated for hours, weighing each argument, before reaching a unanimous decision that surprised no one.|How was the decision reached?|Everyone agreed|It was split|4',
    'Skeptical at first, the critics were gradually persuaded by the overwhelming evidence the research team presented.|What changed the critics\' minds?|The evidence|A gift|4',
    'Though the sculptor\'s early work was derivative, echoing his teachers, his later pieces were unmistakably original.|How did his later work differ?|It was original|It copied others|5',
    'The statesman\'s eloquence was legendary; yet, paradoxically, he insisted that his greatest talent was listening.|What did he say was his greatest talent?|Listening|Speaking|5',
    'Frugal by habit, the old teacher saved nearly everything, yet he donated generously whenever a student needed help.|What was he like?|Thrifty but generous|Wasteful|5',
    'The treaty, for all its grand language, proved ineffectual because neither side was willing to enforce its terms.|Why was the treaty ineffectual?|No one enforced it|It was too short|5'
  ]).map(function (r) { var p = r.split('|'); return { t: p[0], q: p[1], c: p[2], w: p[3], tier: +p[4] }; });

  /* math / number vocabulary */
  B.mterms = rows([
    'sum|the result of adding', 'difference|the result of subtracting', 'product|the result of multiplying', 'quotient|the result of dividing', 'factor|a number that divides another evenly',
    'multiple|a number made by multiplying a whole number', 'fraction|a part of a whole', 'decimal|a number with a point showing parts of one', 'angle|the space between two lines that meet',
    'perimeter|the distance around a shape', 'area|the space inside a shape', 'volume|the amount of space inside a solid', 'average|the sum of numbers divided by how many there are',
    'prime|a number with exactly two factors', 'even|a whole number that can be split into two equal groups', 'odd|a whole number that cannot be split into two equal groups',
    'radius|the distance from the center of a circle to its edge', 'diameter|the distance across a circle through its center', 'circumference|the distance around a circle',
    'parallel|lines that never meet', 'perpendicular|lines that meet at a right angle', 'triangle|a shape with three sides', 'rectangle|a shape with four sides and four right angles',
    'pentagon|a shape with five sides', 'hexagon|a shape with six sides', 'octagon|a shape with eight sides', 'ratio|a comparison of two amounts', 'percent|a part out of one hundred',
    'median|the middle number in an ordered list', 'mode|the number that appears most often', 'range|the difference between the largest and smallest number', 'integer|a whole number, positive or negative',
    'numerator|the top number of a fraction', 'denominator|the bottom number of a fraction', 'equation|a statement that two things are equal', 'variable|a letter that stands for an unknown number',
    'exponent|a small number showing how many times to multiply a number by itself', 'symmetry|when one half of a shape matches the other half', 'vertex|a corner where lines meet', 'estimate|a close guess of an amount'
  ]).map(function (r) { var p = r.split('|'); return [p[0], p[1]]; });
  B.symbols = [['+', 'plus'], ['−', 'minus'], ['×', 'times'], ['÷', 'divided by'], ['=', 'equals'], ['<', 'less than'], ['>', 'greater than'], ['%', 'percent'], ['≠', 'not equal to'], ['≤', 'less than or equal to'], ['≥', 'greater than or equal to'], ['√', 'square root'], ['π', 'pi'], ['∞', 'infinity'], ['°', 'degrees']];
  B.numw = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million'.split(' ');
  B.numv = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 1000000];

  /* emoji to word (only clear, common pictures) */
  B.emoji = rows([
    '🐱|cat', '🐶|dog', '🐟|fish', '🍎|apple', '🚗|car', '🌞|sun', '🌙|moon', '⭐|star', '🏠|house', '📚|books', '⚽|ball', '🌳|tree', '🚀|rocket', '🎵|music', '🔑|key', '☂️|umbrella', '🍕|pizza', '✈️|plane', '🎂|cake',
    '🐘|elephant', '🦁|lion', '🐯|tiger', '🐻|bear', '🐼|panda', '🐸|frog', '🐢|turtle', '🐍|snake', '🦋|butterfly', '🐝|bee', '🐞|ladybug', '🦀|crab', '🐙|octopus', '🐬|dolphin', '🐳|whale', '🦈|shark', '🐧|penguin', '🦉|owl', '🦅|eagle',
    '🐔|chicken', '🐴|horse', '🐮|cow', '🐷|pig', '🐑|sheep', '🐵|monkey', '🐰|rabbit', '🦊|fox', '🐺|wolf', '🦒|giraffe', '🦓|zebra', '🌹|rose', '🌻|sunflower', '🍌|banana', '🍇|grapes', '🍉|watermelon', '🍓|strawberry', '🍒|cherries', '🍍|pineapple',
    '🥕|carrot', '🌽|corn', '🍔|burger', '🍟|fries', '🍦|icecream', '🍩|donut', '🍪|cookie', '🎈|balloon', '🎁|gift', '🔔|bell', '🎸|guitar', '🥁|drum', '🎹|piano', '🏀|basketball', '🎾|tennis', '🚲|bicycle', '🚌|bus', '🚂|train', '🚢|ship', '🚁|helicopter',
    '🏰|castle', '⛺|tent', '🌈|rainbow', '☁️|cloud', '⚡|lightning', '🔥|fire', '❄️|snowflake', '🌊|wave', '🌋|volcano', '🗻|mountain', '🌵|cactus', '🍄|mushroom', '👑|crown', '💍|ring', '👓|glasses', '👕|shirt', '👟|shoe', '🎩|hat', '📱|phone', '💻|laptop',
    '⏰|clock', '✏️|pencil', '✂️|scissors', '🔨|hammer', '💡|bulb', '🔒|lock', '📷|camera'
  ]).map(function (r) { var p = r.split('|'); return [p[0], p[1]]; });

  /* drawn shapes (viewBox 0 0 40 40) */
  B.shapes = {
    circle: '<circle cx="20" cy="20" r="16"/>', square: '<rect x="6" y="6" width="28" height="28"/>', triangle: '<polygon points="20,4 36,34 4,34"/>',
    star: '<polygon points="20,3 25,15 38,16 28,25 31,38 20,31 9,38 12,25 2,16 15,15"/>', diamond: '<polygon points="20,2 36,20 20,38 4,20"/>',
    hexagon: '<polygon points="12,4 28,4 38,20 28,36 12,36 2,20"/>', cross: '<path d="M15 4h10v11h11v10H25v11H15V25H4V15h11z"/>',
    heart: '<path d="M20 36C4 24 3 12 11 8c5-2 8 1 9 4 1-3 4-6 9-4 8 4 7 16-9 28z"/>', pentagon: '<polygon points="20,3 37,16 31,36 9,36 3,16"/>',
    octagon: '<polygon points="12,3 28,3 37,12 37,28 28,37 12,37 3,28 3,12"/>', crescent: '<path d="M26 4a16 16 0 1 0 0 32 13 13 0 1 1 0-32z"/>',
    arrow: '<polygon points="4,16 24,16 24,6 38,20 24,34 24,24 4,24"/>', bolt: '<polygon points="24,2 8,22 19,22 15,38 32,17 21,17"/>',
    drop: '<path d="M20 3C12 14 7 20 7 26a13 13 0 0 0 26 0c0-6-5-12-13-23z"/>', ring: '<path fill-rule="evenodd" d="M20 4a16 16 0 1 0 0 32 16 16 0 0 0 0-32zm0 9a7 7 0 1 1 0 14 7 7 0 0 1 0-14z"/>',
    oval: '<ellipse cx="20" cy="20" rx="17" ry="11"/>', trapezoid: '<polygon points="11,8 29,8 37,32 3,32"/>', semicircle: '<path d="M3 28a17 17 0 0 1 34 0z"/>'
  };

  /* odd-one-out groups (3 options: two from the same group + one stranger) */
  B.groups = rows([
    'cat dog horse lion tiger rabbit sheep monkey', 'apple grape lemon mango peach banana cherry melon', 'red blue green yellow purple orange pink brown',
    'hand foot knee elbow shoulder finger ankle wrist', 'car bus train plane truck bicycle boat taxi', 'spoon fork knife plate bowl cup pan kettle',
    'rose tulip daisy lily orchid jasmine lotus sunflower', 'pencil pen eraser ruler marker crayon chalk notebook', 'carrot potato onion cabbage spinach pea tomato corn',
    'happy sad angry excited nervous proud lonely calm', 'doctor teacher farmer pilot baker nurse driver artist', 'river lake ocean pond stream sea canal waterfall',
    'north south east west', 'summer winter spring autumn', 'circle square triangle hexagon pentagon rectangle', 'piano guitar drum violin flute trumpet harp sitar'
  ]).map(function (r) { return r.split(' '); });
})(window);
