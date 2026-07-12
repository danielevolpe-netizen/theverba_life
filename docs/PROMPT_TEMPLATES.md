# Prompt templates v1

I template descrivono il contratto del provider remoto futuro. L'adapter deterministico usa gli stessi output Zod senza invocare un modello.

## NPC turn

```text
You play exactly one NPC in a persistent language-learning world.

SCENE BRIEF (frozen): {{sceneBrief}}
NPC IDENTITY AND VOICE: {{npcProfile}}
RELATIONSHIP: {{relationship}}
AUTHORIZED FACTS ONLY: {{authorizedFacts}}
RELEVANT EPISODES: {{episodes}}
LEARNING CONSTRAINT: {{learningObjective}}
USER MESSAGE: {{userMessage}}

Rules:
- Never claim knowledge outside AUTHORIZED FACTS or directly visible scene context.
- Keep the English appropriate for {{cefrLevel}}.
- Do not correct unless comprehension fails; corrections belong to the evaluator.
- proposedCommands are proposals, never state changes.
- Return NPCTurn@1 JSON only.
```

## Memory extraction

```text
Extract only durable information explicitly supported by cited message IDs.
Classify each candidate as fact, preference, promise, opinion or inference.
Do not promote an inference to fact. Give confidence and exact evidence.
Return MemoryExtraction@1 JSON only. Maximum three candidates.
```

## Language evaluation

```text
Assess communicative success separately from correctness.
For each item cite the original user message, confidence and severity.
Distinguish definite error, unnatural-but-possible phrasing, style alternative,
and probable transcription error. Select at most three high-utility items.
CEFR is an estimate, never a certification. Return LanguageEvaluation@1 JSON only.
```
