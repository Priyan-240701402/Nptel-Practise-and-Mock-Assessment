import json

with open('src/data/llmQuestions.json', encoding='utf-8') as f:
    llm = json.load(f)

print("LLM course totalQuestions field:", llm.get('totalQuestions'))
print("LLM course actual questions in array:", len(llm.get('questions', [])))
print("LLM syllabus weeks count:", len(llm.get('syllabus', [])))

errs = []
ids = set()
for q in llm.get('questions', []):
    qid = q.get('id')
    if not qid:
        errs.append("Missing id")
    if qid in ids:
        errs.append(f"Duplicate id: {qid}")
    ids.add(qid)
    
    if not q.get('week'):
        errs.append(f"{qid}: missing week")
    if not q.get('question'):
        errs.append(f"{qid}: missing question text")
        
    opts = q.get('options')
    if not isinstance(opts, list) or len(opts) != 4:
        errs.append(f"{qid}: invalid options array")
    else:
        for o in opts:
            if not o.get('id') or not o.get('text'):
                errs.append(f"{qid}: invalid option object: {o}")
                
    cid = q.get('correctOptionId')
    cans = q.get('correctAnswer')
    if cid not in {'A', 'B', 'C', 'D'}:
        errs.append(f"{qid}: invalid correctOptionId {cid}")
    if cid != cans:
        errs.append(f"{qid}: mismatch correctOptionId ({cid}) != correctAnswer ({cans})")
        
    matched = [o for o in opts if o.get('id') == cid]
    if len(matched) != 1:
        errs.append(f"{qid}: correct option {cid} not found in options list")
        
    if not q.get('explanation'):
        errs.append(f"{qid}: missing explanation")

print("Validation errors in LLM questions:", len(errs))
if errs:
    for e in errs[:10]:
        print(" -", e)

# Check Entrepreneurship
with open('src/data/entrepreneurshipQuestions.json', encoding='utf-8') as f:
    ent = json.load(f)
print("Entrepreneurship total questions:", len(ent.get('questions', [])))
print("All validations completed successfully!")
