import json
from collections import Counter

with open('src/data/llmQuestions.json', encoding='utf-8') as f:
    data = json.load(f)

qs = data['questions']
ids = set()
errs = []

for i, q in enumerate(qs):
    qid = q.get('id')
    if qid in ids:
        errs.append(f'Duplicate ID: {qid}')
    ids.add(qid)
    
    wk = q.get('week')
    if wk not in range(1, 13):
        errs.append(f'Invalid week in {qid}: {wk}')
        
    opts = q.get('options')
    if not isinstance(opts, list) or len(opts) != 4:
        errs.append(f'Invalid options list in {qid}')
    else:
        for opt in opts:
            if opt.get('id') not in {'A', 'B', 'C', 'D'} or not opt.get('text'):
                errs.append(f'Invalid option entry in {qid}: {opt}')
                
    ans = q.get('correctAnswer')
    cid = q.get('correctOptionId')
    if ans != cid:
        errs.append(f'Mismatch correctAnswer and correctOptionId in {qid}: {ans} vs {cid}')
    if ans not in {'A', 'B', 'C', 'D'}:
        errs.append(f'Invalid correctAnswer in {qid}: {ans}')
        
    exp = q.get('explanation')
    if not exp or not exp.strip():
        errs.append(f'Missing explanation in {qid}')

print(f"Total questions: {len(qs)}")
print(f"Errors found: {len(errs)}")
if errs:
    for e in errs[:10]:
        print(" -", e)

print("\nWeek distribution:")
for wk, count in sorted(Counter(q['week'] for q in qs).items()):
    print(f"  Week {wk:2d}: {count} questions")

print("\nDifficulty distribution:")
for diff, count in Counter(q.get('difficulty') for q in qs).items():
    print(f"  {diff}: {count}")

print("\nAnswer key distribution:")
for ans, count in sorted(Counter(q.get('correctAnswer') for q in qs).items()):
    print(f"  {ans}: {count}")

print("\nSample question check:")
sample = qs[0]
print(f"ID: {sample['id']}")
print(f"Week: {sample['week']}")
print(f"Question: {sample['question']}")
print("Options:")
for opt in sample['options']:
    print(f"  {opt['id']}: {opt['text']}")
print(f"Correct: {sample['correctAnswer']}")
print(f"Explanation: {sample['explanation']}")
