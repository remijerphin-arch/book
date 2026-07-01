export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  content: string;
  published: boolean;
  publishDate?: string | null;
  estimatedReadTime: number; // in minutes
}

export interface Part {
  id: string;
  partNumber: number;
  title: string;
  subtitle: string;
  chapters: Chapter[];
}

export const initialBookData: Part[] = [
  {
    id: "part-1",
    partNumber: 1,
    title: "PART 1",
    subtitle: "The One I Miss",
    chapters: [
      {
        id: "ch-1-1",
        chapterNumber: 1,
        title: "The One I Miss",
        content: `I walked into college, a blank new page,
In a class called 'I', on a life's small stage.
Found a gang, found laughter, found days that shone—
But somewhere in the crowd, I felt her alone.

She was quiet like mornings, calm like the skies,
Kind when she spoke, and storm in her eyes.
With someone beside her, always near,
And I—just watching, holding back fear.

Their names were whispered, in laughter and tease,
A "perfect match" carried soft on the breeze.
Doubt crept in, like shadows at night,
And fear made me speak, though it didn't feel right.

I told her my worry, I told her my guess,
But wrapped it in lies I couldn't confess.
"A recording," I said — though I knew it untrue.
All I wanted was not to lose you.

She looked at me, not with hate, but pain,
And walked away in silence like rain.
"Don't talk to me," was the final goodbye,
And in that silence, I learned how to cry.

Six months have passed, slow like a song,
Where every note still feels so wrong.
She blocked me out, shut every door,
But in my chest, she echoes more.

I said my sorry, I stepped away,
But every night, I still hope and pray.
Not to change time or rewrite fate,
But just for peace — not this weight.

And if she ever reads between the lines,
May she know this heart still shines.
Not with begging, not with plea—
Just a quiet hope... she remembers me.`,
        published: true,
        publishDate: "2026-06-01T12:00:00Z",
        estimatedReadTime: 2,
      }
    ]
  },
  {
    id: "part-2",
    partNumber: 2,
    title: "PART 2",
    subtitle: "The One I Found",
    chapters: [
      {
        id: "ch-2-1",
        chapterNumber: 1,
        title: "The One I Found",
        content: `A new year began, a new class, new place,
But the one I once watched... she was gone without trace.

No more shared benches, no morning view,
Just an empty space where my heart once grew.
I tried to forget, tried to let life restart,
But her memory still pulled at the cracks in my heart.
Days felt heavy, like stories half-told—
Until someone else stepped into the cold.
She wasn't like her, not shining or bright,
Not the kind of face that steals all the light.
But somehow her smile, quiet and small,
Felt like medicine slipping into the fall.
She didn't fix everything, not all the way through,
But she covered the cracks with tapes of blue.
Little by little, she softened the ache,
Making my heart whole for its own sake.
I don't talk to her much, not even "hi,"
Yet I look for her always, don't even know why.
I don't care if she sees me, or looks away—
Just seeing her once can lift my day.
She's not perfect to many, but perfect to me,
A calm in the storm, where my heart can breathe free.

Maybe she'll never know what she became—
A quiet hope, a soft little flame.
And if life ever lets our stories meet,
If she ever finds my words or hears my heartbeat,
May she know she helped me, without ever trying—
Held me together when inside I was crying.
I don't ask for love, or a hand to hold tight...
Just peace in my chest when I sleep at night.
And maybe one day, when she reads this line—
She'll know, in my silence...
She once healed what wasn't mine.`,
        published: true,
        publishDate: "2026-06-15T12:00:00Z",
        estimatedReadTime: 2,
      }
    ]
  },
  {
    id: "part-3",
    partNumber: 3,
    title: "PART 3",
    subtitle: "The One I Couldn't Say",
    chapters: [
      {
        id: "ch-3-1",
        chapterNumber: 1,
        title: "The One I Couldn't Say",
        content: `I learned the cost of a careless lie,
How fear can break what truth won't try.
So when you came, soft and unknown,
I built my walls... and stayed alone.

You weren't like storms that shake the sky,
You felt like peace I couldn't deny.
But scars don't fade just because time moves,
They whisper doubts in silent grooves.

I wanted to speak, to stand, to be real,
But fear made me hide what I truly feel.
So I became shadows you couldn't see,
A name, a text... but never "me."

Through borrowed words and a faceless name,
I called you pretty, played a game.
"Blue suits you," I'd softly write,
Then disappear before the light.

You searched for someone I pretended to be,
While the real me sat quietly...
Just a desk away, in the same old room,
Hiding a heart that feared its doom.

You blocked those words, you pushed them away,
And maybe that's fair—I lost my way.
Because love shouldn't hide behind a screen,
Or live in spaces that aren't seen.

Still... when you smile, the world feels right,
Like broken days find a bit of light.
I don't need answers, I don't need a sign,
Just seeing you somehow feels like mine.

I don't know if you'd ever understand,
The silent boy who chose not to stand.
Not because he didn't care enough—
But because his past had made him rough.

So here I stay, between truth and fear,
Wanting you close, but staying unclear.
Not asking love, not asking you—
Just holding on to this quiet view.

And maybe someday, if courage grows,
I'll be more than the ghost she knows...
But until then, I'll stay this way—
A heart that loves... but couldn't say.`,
        published: true,
        publishDate: "2026-07-01T12:00:00Z",
        estimatedReadTime: 2,
      }
    ]
  },
  {
    id: "part-4",
    partNumber: 4,
    title: "PART 4",
    subtitle: "The One I Finally Said...",
    chapters: [
      {
        id: "ch-4-1",
        chapterNumber: 1,
        title: "The One I Finally Said...",
        content: `This part has already been written by the author but has not yet been published. Stay tuned for its release.`,
        published: false,
        publishDate: null,
        estimatedReadTime: 1,
      }
    ]
  },
  {
    id: "part-5",
    partNumber: 5,
    title: "CHAPTER 2 PART 1",
    subtitle: "The Words I Couldn't Speak...",
    chapters: [
      {
        id: "ch-5-1",
        chapterNumber: 1,
        title: "The Words I Couldn't Speak...",
        content: `This part has already been written by the author but has not yet been published. Stay tuned for its release.`,
        published: false,
        publishDate: null,
        estimatedReadTime: 1,
      }
    ]
  }
];

export const quotes = [
  "Some hearts never break. They quietly become silent.",
  "Some feelings are never spoken. Some stories are never named.",
  "In the silence between us, the loudest words are the ones we never say.",
  "We are all ghosts in the memories of those we loved too quietly.",
  "You once healed what wasn't yours, and left me with what was always mine.",
  "Maybe some stories are beautiful precisely because they are half-told.",
  "I don't ask for a hand to hold... just peace when the shadows fall."
];
