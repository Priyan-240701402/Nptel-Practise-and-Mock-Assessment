# Python script to generate authoritative question banks for both courses
# Foundations of Entrepreneurship: 180 MCQs extracted directly from 12 uploaded assignment PDFs.
# Introduction to Large Language Models: 100 MCQs preserved.

import os
import re
import json
import pypdf

os.makedirs('src/data', exist_ok=True)
os.makedirs('src/data/entrepreneurship', exist_ok=True)

# ----------------- Course 1: Foundations of Entrepreneurship -----------------
import pypdf
import os
import re
import json

pdf_files = [
    (1, 'Week_1_Assignment.pdf', 1, "Introduction to Innovation & Entrepreneurship"),
    (2, 'Week_2_Assignment.pdf', 2, "Opportunity Identification & Idea Generation"),
    (3, 'Week_3_Assignment_Final.pdf', 3, "Customer Value Proposition"),
    (4, 'Week_4_Assignment_Final.pdf', 4, "New Product Development"),
    (5, 'Week_5_Assignment_Final.pdf', 4, "New Product Development"),
    (6, 'Week_6_Assignment_Final_updated.pdf', 5, "Marketing & Go-to-Market"),
    (7, 'Week_7_Assignment_Final.pdf', 5, "Marketing & Go-to-Market"),
    (8, 'Week_8_Assignment_Final.pdf', 6, "Finance for Entrepreneurs"),
    (9, 'Week_9_Assignment.pdf', 6, "Finance for Entrepreneurs"),
    (10, 'Week_10_Assignment.pdf', 7, "Strategy, Leadership & Business Planning"),
    (11, 'Week_11_Assignment.pdf', 7, "Strategy, Leadership & Business Planning"),
    (12, 'Week_12_Assignment_Final.pdf', 8, "Communication & Investor Pitching")
]

base_dir = r'C:\Users\priya\Downloads'

# Topic mappings for all 180 questions
# (week, qnum) -> topic
TOPIC_MAP = {
    # Week 1
    (1, 1): "Course Expectations",
    (1, 2): "Why Entrepreneurship, Why Now",
    (1, 3): "What It Entails to Be an Entrepreneur",
    (1, 4): "The Indian Economy Rising",
    (1, 5): "The Indian Economy Rising",
    (1, 6): "The Indian Economy Rising",
    (1, 7): "Atomberg Founder Case Study",
    (1, 8): "Atomberg Founder Case Study",
    (1, 9): "Creativity, Innovation, and Entrepreneurship",
    (1, 10): "Creativity, Innovation, and Entrepreneurship",
    (1, 11): "Creativity, Innovation, and Entrepreneurship",
    (1, 12): "Course Expectations",
    (1, 13): "What It Entails to Be an Entrepreneur",
    (1, 14): "What It Entails to Be an Entrepreneur",
    (1, 15): "Course Expectations",

    # Week 2
    (2, 1): "Problems, Opportunities, and Ideas",
    (2, 2): "Problems, Opportunities, and Ideas",
    (2, 3): "Problems, Opportunities, and Ideas",
    (2, 4): "Healthcare Sector with Rizwan Koita",
    (2, 5): "Demystifying AI with Anand Deshpande",
    (2, 6): "Demystifying AI with Anand Deshpande",
    (2, 7): "Demystifying AI with Anand Deshpande",
    (2, 8): "Demystifying AI with Anand Deshpande",
    (2, 9): "Demystifying AI with Anand Deshpande",
    (2, 10): "Healthcare Sector with Rizwan Koita",
    (2, 11): "Healthcare Sector with Rizwan Koita",
    (2, 12): "Demystifying AI with Anand Deshpande",
    (2, 13): "Opportunities Landscape in Multiple Domains",
    (2, 14): "Opportunities Landscape in Multiple Domains",
    (2, 15): "Healthcare Sector with Rizwan Koita",

    # Week 3
    (3, 1): "Concept of Customer Value",
    (3, 2): "Market and Customer Segmentation",
    (3, 3): "Market and Customer Segmentation",
    (3, 4): "Creating a Customer Value Proposition",
    (3, 5): "CVP Formats and References",
    (3, 6): "CVP Formats and References",
    (3, 7): "Creating a Customer Value Proposition",
    (3, 8): "Customer Discovery",
    (3, 9): "Customer Discovery",
    (3, 10): "Customer Discovery Example",
    (3, 11): "Concept of Customer Value",
    (3, 12): "Business Models",
    (3, 13): "Business Models",
    (3, 14): "Business Models",
    (3, 15): "Creating a Customer Value Proposition",

    # Week 4
    (4, 1): "Stages of New Product Development",
    (4, 2): "CVP to Benefits and Features",
    (4, 3): "CVP to Benefits and Features",
    (4, 4): "Stages of New Product Development",
    (4, 5): "Stages of New Product Development",
    (4, 6): "Stages of New Product Development",
    (4, 7): "Minimum Viable Product",
    (4, 8): "Minimum Viable Product",
    (4, 9): "Stages of New Product Development",
    (4, 10): "Design Thinking",
    (4, 11): "Stages of New Product Development",
    (4, 12): "Minimum Viable Product",
    (4, 13): "Minimum Viable Product",
    (4, 14): "Minimum Viable Product",
    (4, 15): "Stages of New Product Development",

    # Week 5
    (5, 1): "Britannia Case Study",
    (5, 2): "Britannia Case Study",
    (5, 3): "Britannia Case Study",
    (5, 4): "Britannia Case Study",
    (5, 5): "Stages of New Product Development",
    (5, 6): "Medical Devices Case Study",
    (5, 7): "Intellectual Property Basics",
    (5, 8): "Intellectual Property Patents",
    (5, 9): "Intellectual Property Patents",
    (5, 10): "Intellectual Property Basics",
    (5, 11): "Intellectual Property Basics",
    (5, 12): "Intellectual Property Basics",
    (5, 13): "Intellectual Property Basics",
    (5, 14): "Intellectual Property Basics",
    (5, 15): "Intellectual Property Patents",

    # Week 6
    (6, 1): "Go-to-Market Basics",
    (6, 2): "Role of Marketing",
    (6, 3): "Marketing Mix",
    (6, 4): "Marketing Mix",
    (6, 5): "Marketing Mix",
    (6, 6): "Product Branding",
    (6, 7): "Product Branding",
    (6, 8): "Product Branding",
    (6, 9): "Differentiation",
    (6, 10): "Tanishq Case Study",
    (6, 11): "Pricing Strategies",
    (6, 12): "Pricing Strategies",
    (6, 13): "Promotional Strategies",
    (6, 14): "Promotional Strategies",
    (6, 15): "Promotional Strategies",

    # Week 7
    (7, 1): "Digital Customer Journey",
    (7, 2): "Digital Customer Journey",
    (7, 3): "FinTech Customer Journey Case Study",
    (7, 4): "Digital Customer Journey",
    (7, 5): "Sales Strategies",
    (7, 6): "Sales Strategies",
    (7, 7): "Sales Strategies",
    (7, 8): "Sales Strategies",
    (7, 9): "Sales Channels",
    (7, 10): "B2B Sales and Marketing",
    (7, 11): "B2B Sales and Marketing",
    (7, 12): "B2B Sales and Marketing",
    (7, 13): "B2B Sales and Marketing",
    (7, 14): "Role of Marketing",
    (7, 15): "Go-to-Market Planning",

    # Week 8
    (8, 1): "Accounting and Finance Terminology",
    (8, 2): "Accounting and Finance Terminology",
    (8, 3): "Accounting and Finance Terminology",
    (8, 4): "Accounting and Finance Terminology",
    (8, 5): "Profit and Loss Statement",
    (8, 6): "Balance Sheet",
    (8, 7): "Profit and Loss Statement",
    (8, 8): "Cash Flow Statement",
    (8, 9): "Cash Flow Statement",
    (8, 10): "Role of Finance in Startups",
    (8, 11): "Balance Sheet",
    (8, 12): "Financial Statements Case Study",
    (8, 13): "Unit Economics",
    (8, 14): "Unit Economics",
    (8, 15): "Cash Flow Statement",

    # Week 9
    (9, 1): "Business Planning",
    (9, 2): "Financial Planning",
    (9, 3): "Financial Planning",
    (9, 4): "Fundraising at Different Startup Stages",
    (9, 5): "Fundraising at Different Startup Stages",
    (9, 6): "Role of Finance in Startups",
    (9, 7): "Venture Finance",
    (9, 8): "Venture Finance",
    (9, 9): "Investor Expectations",
    (9, 10): "Investor Expectations",
    (9, 11): "Finance as Strategy",
    (9, 12): "Finance as Strategy",
    (9, 13): "Finance as Strategy",
    (9, 14): "Role of Finance in Startups",
    (9, 15): "Role of Finance in Startups",

    # Week 10
    (10, 1): "Strategy Fundamentals",
    (10, 2): "Strategy Fundamentals",
    (10, 3): "Strategy Fundamentals",
    (10, 4): "Ten Tests of Strategy",
    (10, 5): "Strategy Fundamentals",
    (10, 6): "Entrepreneurial Leadership",
    (10, 7): "Entrepreneurial Leadership",
    (10, 8): "Entrepreneurial Leadership",
    (10, 9): "Infiheal Founder Case Study",
    (10, 10): "Infiheal Founder Case Study",
    (10, 11): "Entrepreneurial Leadership",
    (10, 12): "Entrepreneurial Leadership",
    (10, 13): "Ten Tests of Strategy",
    (10, 14): "Strategy Fundamentals",
    (10, 15): "Entrepreneurial Leadership",

    # Week 11
    (11, 1): "Business Models",
    (11, 2): "Business Models",
    (11, 3): "Business Model Canvas: Demand Side",
    (11, 4): "Business Model Canvas: Demand Side",
    (11, 5): "Business Model Canvas: Supply Side",
    (11, 6): "Business Models",
    (11, 7): "Business Models",
    (11, 8): "Business Model Canvas: Demand Side",
    (11, 9): "Business Models",
    (11, 10): "Social Business Model",
    (11, 11): "Social Business Model",
    (11, 12): "Social Business Model",
    (11, 13): "Social Business Model",
    (11, 14): "Social Business Model",
    (11, 15): "Business Model Canvas Examples",

    # Week 12
    (12, 1): "Pitching to Investors",
    (12, 2): "Becoming a Good Communicator",
    (12, 3): "Becoming a Good Communicator",
    (12, 4): "Becoming a Good Communicator",
    (12, 5): "Value Creation Potential",
    (12, 6): "Value Creation Potential",
    (12, 7): "Pitching to Investors",
    (12, 8): "Pitching to Investors",
    (12, 9): "Airth Founder Case Study",
    (12, 10): "Airth Founder Case Study",
    (12, 11): "Airth Founder Case Study",
    (12, 12): "Airth Founder Case Study",
    (12, 13): "Course Closure",
    (12, 14): "Course Closure",
    (12, 15): "Course Closure"
}

def clean_text(t):
    if not t:
        return ''
    t = t.replace('\xa0', ' ').replace('\u200b', '')
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

all_weeks_data = {}
all_questions = []

for week_num, fname, module_id, module_name in pdf_files:
    fpath = os.path.join(base_dir, fname)
    reader = pypdf.PdfReader(fpath)
    full_text = '\n'.join([page.extract_text() or '' for page in reader.pages])
    
    q_indices = []
    for qnum in range(1, 16):
        pattern = rf'(?:^|\n)\s*{qnum}\.\s+'
        m = re.search(pattern, full_text)
        assert m, f"Week {week_num} missing Q{qnum}"
        q_indices.append((qnum, m.start()))
    q_indices.sort(key=lambda x: x[1])
    
    week_qs = []
    for idx, (qnum, start_pos) in enumerate(q_indices):
        end_pos = q_indices[idx + 1][1] if idx + 1 < len(q_indices) else len(full_text)
        block = full_text[start_pos:end_pos].strip()
        
        # Ans line
        ans_m = re.search(r'Ans:\s*([a-dA-D])(?:\)|:|\.|\s)?\s*(.*?)(?:\n|$)', block)
        assert ans_m, f"Week {week_num} Q{qnum} missing Ans: line"
        ans_letter = ans_m.group(1).upper()
        
        # Options
        opt_a_m = re.search(r'(?:^|\n)\s*a\)\s*(.*?)(?=\n\s*b\)|\Z)', block, re.DOTALL)
        opt_b_m = re.search(r'(?:^|\n)\s*b\)\s*(.*?)(?=\n\s*c\)|\Z)', block, re.DOTALL)
        opt_c_m = re.search(r'(?:^|\n)\s*c\)\s*(.*?)(?=\n\s*d\)|\Z)', block, re.DOTALL)
        opt_d_m = re.search(r'(?:^|\n)\s*d\)\s*(.*?)(?=\n\s*Ans:|\Z)', block, re.DOTALL)
        
        assert opt_a_m and opt_b_m and opt_c_m and opt_d_m, f"Week {week_num} Q{qnum} missing option"
        
        qm = re.search(rf'^{qnum}\.\s*(.*?)(?=\n\s*a\))', block, re.DOTALL)
        assert qm, f"Week {week_num} Q{qnum} failed question text extraction"
        q_text = clean_text(qm.group(1))
        
        opt_a = clean_text(opt_a_m.group(1))
        opt_b = clean_text(opt_b_m.group(1))
        opt_c = clean_text(opt_c_m.group(1))
        opt_d = clean_text(opt_d_m.group(1))
        
        topic = TOPIC_MAP.get((week_num, qnum), "Entrepreneurship Concepts")
        
        q_id = f"ENT-W{week_num:02d}-Q{qnum:02d}"
        
        q_obj = {
            "id": q_id,
            "courseId": "entrepreneurship",
            "week": week_num,
            "moduleId": module_id,
            "moduleName": module_name,
            "topic": topic,
            "sourceType": "Uploaded Weekly Assignment",
            "sourceFile": fname,
            "question": q_text,
            "options": [
                {"id": "A", "text": opt_a},
                {"id": "B", "text": opt_b},
                {"id": "C", "text": opt_c},
                {"id": "D", "text": opt_d}
            ],
            "correctOptionId": ans_letter,
            "explanation": "",
            "difficulty": "Unclassified"
        }
        week_qs.append(q_obj)
        all_questions.append(q_obj)
        
    all_weeks_data[week_num] = {
        "week": week_num,
        "moduleId": module_id,
        "moduleName": module_name,
        "assessmentTitle": f"Week {week_num} Assessment",
        "sourceFile": fname,
        "sourceNote": f"Official Week {week_num} Assignment (15 questions)",
        "questions": week_qs
    }

print(f"Total weeks processed: {len(all_weeks_data)}")
print(f"Total questions created: {len(all_questions)}")

# Write weekly JSON files
output_dir = r'c:\Users\priya\Downloads\Nptel\src\data\entrepreneurship'
for week_num, wdata in all_weeks_data.items():
    wfile = os.path.join(output_dir, f"week{week_num:02d}.json")
    with open(wfile, 'w', encoding='utf-8') as f:
        json.dump(wdata, f, indent=2, ensure_ascii=False)
    print(f"Wrote {wfile} with {len(wdata['questions'])} questions.")

# Write entrepreneurshipQuestions.json
ent_questions_file = r'c:\Users\priya\Downloads\Nptel\src\data\entrepreneurshipQuestions.json'
with open(ent_questions_file, 'w', encoding='utf-8') as f:
    json.dump({
        "courseId": "entrepreneurship",
        "courseTitle": "Foundations of Entrepreneurship",
        "totalQuestions": len(all_questions),
        "questions": all_questions
    }, f, indent=2, ensure_ascii=False)
print(f"Wrote {ent_questions_file} with {len(all_questions)} questions.")


# ----------------- Course 2: Introduction to Large Language Models -----------------
llm_topics = [
    ("Foundations of NLP & Language Modeling", [
        ("What is the fundamental goal of statistical language modeling?",
         ["To maximize computer CPU clock frequency", "To estimate the probability distribution over sequences of words or tokens", "To render 3D computer graphics from text", "To translate machine code into assembly language"],
         "B", "Language modeling fundamentally assigns probabilities P(w1, w2, ..., wn) to sequences of words or tokens.", "Easy"),
        ("In an n-gram language model, the Markov assumption states that:",
         ["The probability of a word depends only on the previous n-1 words", "Every word is completely independent of all context", "Words have infinite long-range dependencies across chapters", "Word order does not matter at all"],
         "A", "The n-gram Markov assumption approximates the probability of the current token by conditioning only on the prior n-1 tokens.", "Medium"),
        ("Which classic smoothing technique handles zero-probability unseen n-grams by reallocating probability mass?",
         ["Kneser-Ney smoothing", "Gradient descent", "Backpropagation through time", "AdamW optimization"],
         "A", "Kneser-Ney smoothing is a renowned technique that accounts for the continuation probability of unseen n-grams.", "Hard"),
        ("What limitation of traditional Bag-of-Words (BoW) models do distributed word representations (Word2Vec) overcome?",
         ["BoW ignores word order and treats words as orthogonal one-hot vectors with zero semantic similarity", "BoW is too slow to execute on modern computers", "BoW cannot represent punctuation marks", "BoW requires deep transformers with millions of parameters"],
         "A", "BoW one-hot vectors are orthogonal and cannot represent semantic relatedness (e.g., king - man + woman = queen).", "Easy"),
        ("The Continuous Bag-of-Words (CBOW) architecture in Word2Vec predicts:",
         ["The surrounding context words given a single target word", "The target center word given its surrounding context words", "The sentiment score of an entire sentence", "The next paragraph in a document"],
         "B", "CBOW predicts the target center word from context tokens, whereas the Skip-Gram model predicts context from the target.", "Medium"),
        ("What problem plagued standard Recurrent Neural Networks (RNNs) when processing long text sequences?",
         ["Vanishing and exploding gradients making it difficult to capture long-range dependencies", "Inability to run on CPU processors", "Inability to work with floating point numbers", "Instant overfitting on single sentences"],
         "A", "Standard RNNs suffer from vanishing and exploding gradients over long unrolled recurrent steps.", "Easy"),
        ("How do Long Short-Term Memory (LSTM) networks address the vanishing gradient problem?",
         ["By removing all non-linear activation functions", "Through gated memory cells (input, forget, and output gates) maintaining constant error carousels", "By processing all sequence words simultaneously in parallel", "By ignoring all past context tokens"],
         "B", "LSTMs use explicit forget, input, and output gates along a continuous cell state line to preserve gradients.", "Medium"),
        ("What is perplexity in the context of language model evaluation?",
         ["The exponentiated cross-entropy loss measuring how surprised the model is by test data", "The speed at which tokens are generated per second", "The total number of parameters in the neural network", "The percentage of misspelled words in training corpora"],
         "A", "Perplexity is exp(cross-entropy); lower perplexity indicates the model assigns higher probability to ground-truth tokens.", "Medium"),
        ("Why can standard RNNs and LSTMs not be parallelized across time steps during training?",
         ["Because they use GPU acceleration", "Because calculation at step t depends sequentially on hidden state h_(t-1)", "Because text datasets have irregular line endings", "Because they do not have weight matrices"],
         "B", "The sequential recurrence relation h_t = f(h_{t-1}, x_t) prevents parallel forward and backward computation.", "Medium"),
        ("In Word2Vec Skip-Gram with Negative Sampling (SGNS), what does negative sampling do?",
         ["It samples noise words to train a binary logistic regression classifier efficiently without calculating full softmax over vocabulary", "It discards all negative sentiments from sentences", "It removes grammatically incorrect words from text", "It inverts matrix values during backpropagation"],
         "A", "Negative sampling avoids the prohibitive expense of normalising over the entire vocabulary by sampling k noise words.", "Hard"),
        ("What is the primary role of an embedding layer in neural language models?",
         ["To compress text into a single integer", "To map discrete vocabulary indices into continuous dense vector representations in d-dimensional space", "To translate English words into French", "To format output text with HTML styling"],
         "B", "Embedding layers map high-cardinality discrete token IDs into dense semantic vector representations.", "Easy"),
        ("Which loss function is universally used to train autoregressive language models?",
         ["Mean Squared Error (MSE)", "Cross-Entropy Loss (Negative Log-Likelihood)", "Hinge Loss", "Kullback-Leibler divergence with zero prior"],
         "B", "Autoregressive models maximize the log-likelihood of target tokens, equivalent to minimizing cross-entropy loss.", "Easy"),
        ("What is the difference between static embeddings (like GloVe) and contextualized embeddings (like BERT)?",
         ["Static embeddings assign a single vector per word regardless of context; contextual embeddings assign representations based on surrounding tokens", "Static embeddings can only be used on GPUs", "Contextual embeddings do not use vectors", "Static embeddings require 100x more parameters"],
         "A", "Contextualized representations dynamically disambiguate words (e.g., bank of a river vs. money bank) based on context.", "Medium")
    ]),
    ("Transformer Architecture & Self-Attention", [
        ("Who introduced the Transformer architecture in the landmark 2017 paper 'Attention Is All You Need'?",
         ["Yann LeCun et al. at Meta", "Vaswani et al. at Google Brain and Google Research", "Geoffrey Hinton et al. at University of Toronto", "Demis Hassabis at DeepMind"],
         "B", "Vaswani et al. introduced the Transformer architecture in 2017, revolutionizing sequence modeling.", "Easy"),
        ("What is the mathematical formulation of Scaled Dot-Product Attention?",
         ["Attention(Q,K,V) = softmax(Q * K^T / sqrt(d_k)) * V", "Attention(Q,K,V) = sigmoid(Q + K + V)", "Attention(Q,K,V) = ReLU(Q * V^T) * K", "Attention(Q,K,V) = norm(Q - K) * V"],
         "A", "Scaled Dot-Product Attention multiplies Queries with transposed Keys, scales by 1/sqrt(d_k), applies softmax, and weights Values.", "Medium"),
        ("Why is the dot product scaled by 1/sqrt(d_k) in Scaled Dot-Product Attention?",
         ["To invert negative weights into positive values", "To prevent dot products from growing excessively large for large dimensions, which would push softmax into regions with tiny gradients", "To ensure total sum of weights equals zero", "To reduce RAM consumption on GPU chips"],
         "B", "Scaling prevents large magnitude dot products from causing vanishing gradients in the saturated tails of softmax.", "Medium"),
        ("What is the primary motivation for Multi-Head Attention over single-head attention?",
         ["It reduces total parameter count by 50%", "It allows the model to jointly attend to information from different representation subspaces at different positions", "It removes the need for feed-forward layers", "It eliminates the need for GPUs"],
         "B", "Multi-head attention lets different attention heads focus on distinct linguistic relations (e.g., syntax, coreference, semantics).", "Medium"),
        ("Why are Positional Encodings necessary in Transformers?",
         ["Transformers have no built-in recurrence or convolution, making self-attention inherently permutation-invariant without position signals", "To ensure sentences have an even number of characters", "To encrypt tokens before sending across the internet", "To translate token embeddings into audio frequencies"],
         "A", "Because self-attention operates as a set-to-set function, positional encodings must explicitly inject token order information.", "Easy"),
        ("Which of the following is a relative positional encoding method popular in modern LLMs like Llama and Mistral?",
         ["Sinusoidal absolute positional encoding", "RoPE (Rotary Position Embedding)", "ASCII character index addition", "One-hot sequential encoding"],
         "B", "RoPE (Rotary Position Embedding) encodes relative position by rotating key and query representations in complex space.", "Hard"),
        ("What is the difference between Pre-LN (Layer Normalization before sub-layers) and Post-LN Transformers?",
         ["Pre-LN stabilizes gradient flow through residual connections, making deep models easier to train without warm-up", "Post-LN is only used for speech recognition", "Pre-LN requires three times more memory", "Post-LN eliminates all attention layers"],
         "A", "Pre-LN routes the residual path directly without normalization, preventing gradient decay and improving training stability.", "Hard"),
        ("What is the role of causal masking in decoder-only Transformers (like GPT)?",
         ["To blur out profanity in training text", "To prevent attention from looking at future tokens (positions > t) during autoregressive generation", "To compress the model weights into 8-bit integers", "To force the model to translate text backwards"],
         "B", "Causal masking sets upper-triangular attention logits to -infinity so position t cannot attend to subsequent future tokens.", "Easy"),
        ("How does FlashAttention optimize the self-attention operation on modern GPUs?",
         ["By quantizing all matrix values to 1-bit weights", "By tiling computation and recomputing attention on-chip in fast SRAM to minimize high-bandwidth memory (HBM) IO bottlenecks", "By replacing all matrix multiplications with addition operations", "By skipping every alternate token in the sequence"],
         "B", "FlashAttention reorganizes attention computation to minimize slow memory transfers between GPU HBM and SRAM.", "Hard"),
        ("In the Transformer architecture, what constitutes the Feed-Forward Network (FFN) block?",
         ["Two linear transformations with a non-linear activation (e.g., GeLU or SwiGLU) in between, applied position-wise", "A recurrent LSTM gate loop", "A 3D spatial convolution filter", "A random forest ensemble"],
         "A", "The position-wise FFN consists of two linear projections with an activation function like GELU or SwiGLU.", "Medium"),
        ("What distinguishes encoder-decoder models (like T5) from decoder-only models (like GPT)?",
         ["Encoder-decoder uses bidirectional attention on input and causal attention on target; decoder-only uses causal attention throughout", "Decoder-only models cannot output text", "Encoder-decoder models have no attention layers", "Decoder-only models cannot be trained on GPUs"],
         "A", "Encoder-decoder models encode input prompts bidirectionally and generate output tokens autoregressively.", "Medium"),
        ("KV Caching (Key-Value Caching) during LLM inference is used to:",
         ["Prevent retraining on updated Wikipedia articles", "Store previously computed key and value states of prompt tokens so they don't need recomputation at each generated token step", "Cache user prompts in local browser storage", "Compress model weights into zip archives"],
         "B", "KV caching preserves K and V tensors across decoding steps, reducing inference time from O(N^2) to O(N) per step.", "Medium")
    ]),
    ("Pre-training, Tokenization & Datasets", [
        ("What is Byte-Pair Encoding (BPE) in LLM tokenization?",
         ["An encryption standard for secure model weights", "A subword tokenization algorithm that iteratively merges the most frequent pairs of bytes or characters", "A lossless audio compression algorithm", "A method to delete punctuation marks"],
         "B", "BPE is an iterative data compression technique that constructs subword vocabularies by merging frequent adjacent symbol pairs.", "Easy"),
        ("Why is subword tokenization (e.g., BPE, WordPiece, SentencePiece) preferred over word-level tokenization in LLMs?",
         ["It solves the out-of-vocabulary (OOV) problem while maintaining a compact, manageable vocabulary size", "It guarantees zero training loss in one epoch", "It converts all words into emoji representations", "It eliminates the need for embedding matrices"],
         "A", "Subword tokenization splits rare or unseen words into familiar subword pieces, preventing out-of-vocabulary failures.", "Easy"),
        ("What is the typical objective function during the pre-training phase of an autoregressive LLM?",
         ["Next-token prediction (causal language modeling)", "Masked sentence classification", "Image segmentation regression", "Binary sentiment analysis"],
         "A", "Autoregressive LLMs are pre-trained on massive corpora using the self-supervised objective of predicting the next token.", "Easy"),
        ("What did the Chinchilla scaling laws (Hoffmann et al., 2022) reveal regarding compute-optimal LLM training?",
         ["Model parameter count should scale 10x faster than dataset tokens", "Model parameters and training token counts should be scaled in approximately equal proportions", "Training tokens should remain constant while parameters increase infinitely", "Compute budget does not affect final model performance"],
         "B", "Chinchilla demonstrated that for compute-optimal training, model size and training tokens should scale equally (1:1).", "Hard"),
        ("In pre-training data curation, why is deduplication of documents crucial?",
         ["To prevent the model from memorizing repetitive text, regurgitating private data, and degrading perplexity", "To increase the physical size of SSD storage required", "To double the compute power consumed by GPUs", "To introduce random spelling mistakes"],
         "A", "Deduplicating training corpora reduces verbatim memorization, mitigates bias amplification, and improves sample efficiency.", "Medium"),
        ("Which dataset was originally created by scraping outbound links from Reddit with at least 3 karma?",
         ["WebText (used for GPT-2)", "Common Crawl", "ImageNet", "MNIST"],
         "A", "OpenAI created WebText by scraping outbound Reddit links with >=3 upvotes as a proxy for human curation.", "Medium"),
        ("What is the 'curse of multilinguality' observed when pre-training cross-lingual LLMs?",
         ["Adding more languages without increasing model capacity degrades performance on individual high-resource languages", "The model stops speaking any human language", "GPUs cannot handle non-Latin alphabets", "Word order differences crash the training loss to infinity"],
         "A", "When model capacity is fixed, allocating parameters across dozens of languages dilutes representation fidelity for each.", "Hard"),
        ("SentencePiece tokenizer is notable because:",
         ["It treats the input text purely as a raw byte stream without requiring language-specific pre-tokenization or whitespace splitting", "It only works on English text with Oxford commas", "It deletes all numbers from training data", "It translates input text into Python code before tokenizing"],
         "A", "SentencePiece treats whitespace as a regular symbol (_), providing universal tokenizer support across languages.", "Medium"),
        ("What does synthetic data generation contribute to modern frontier LLM pre-training and post-training?",
         ["It exhausts GPU memory without producing tokens", "It augments scarce high-quality reasoning and math datasets through curated, filtered AI-generated examples", "It introduces guaranteed zero hallucination permanently", "It eliminates the need for human safety audits"],
         "B", "High-quality synthetic datasets (e.g., textbook-quality examples, verified math proofs) enrich specialized reasoning capabilities.", "Medium"),
        ("What is the Common Crawl foundation in LLM pre-training?",
         ["An open repository of petabytes of web crawl data used as the primary raw source for web text datasets", "A proprietary Google database closed to researchers", "A benchmark test evaluating LLM reasoning speed", "A hardware protocol for connecting NVIDIA GPUs"],
         "A", "Common Crawl provides open web scrapes that serve as the foundation for filtered datasets like C4, RefinedWeb, and FineWeb.", "Easy"),
        ("What is the primary role of data decontamination in benchmark evaluation?",
         ["Removing test set questions and answers from pre-training and fine-tuning corpora to prevent benchmark contamination", "Scrubbing bacteria from server racks", "Formatting text files to utf-8 encoding", "Deleting all negative reviews from e-commerce sites"],
         "A", "Decontamination ensures test benchmark samples are not leaked into the training set, preventing inflated evaluation metrics.", "Medium"),
        ("Which tokenizer token represents the start or end of a sequence in transformer vocabularies?",
         ["Special tokens such as <BOS>, <EOS>, or <|endoftext|>", "Punctuation periods only", "The uppercase character 'Z'", "The escape key ASCII code"],
         "A", "Special tokens like <s>, </s>, or <|endoftext|> mark boundary conditions like sequence beginning and termination.", "Easy")
    ]),
    ("Fine-Tuning & Adaptation (PEFT, LoRA, Prompt Tuning)", [
        ("What does PEFT stand for in modern LLM fine-tuning?",
         ["Parallelized Execution of Floating Tensors", "Parameter-Efficient Fine-Tuning", "Predictive Error Filtering Technique", "Pre-trained Embedding Fast Translation"],
         "B", "PEFT stands for Parameter-Efficient Fine-Tuning, adapting large models without updating all pre-trained weights.", "Easy"),
        ("How does LoRA (Low-Rank Adaptation) reduce trainable parameters in fine-tuning?",
         ["By pruning 90% of model layers entirely", "By decomposing weight update matrices into low-rank factor matrices delta_W = B * A", "By rounding all weights to 0 or 1", "By training only the embedding layer"],
         "B", "LoRA decomposes the delta update matrix delta_W (d x k) into the product of two low-rank matrices B (d x r) and A (r x k) where r << d.", "Medium"),
        ("In LoRA, if hidden dimension d=4096 and rank r=8, how do trainable parameters compare to full weight matrix W (4096 x 4096)?",
         ["LoRA trains 4096*8*2 = 65,536 parameters instead of ~16.7 million (~0.39%)", "LoRA trains twice as many parameters", "LoRA trains zero parameters", "LoRA trains 8 million parameters"],
         "A", "Full rank requires 4096*4096 = 16,777,216 params, while LoRA factorizes into B (4096x8) + A (8x4096) = 65,536 params.", "Hard"),
        ("What is QLoRA?",
         ["Quantum Computing LoRA", "LoRA applied on top of 4-bit quantized base models using NormalFloat4 (NF4) and double quantization", "Quick LoRA without backward pass", "LoRA implemented exclusively in SQL queries"],
         "B", "QLoRA reduces memory footprint by keeping the frozen base model in 4-bit NF4 while training 16-bit LoRA adapter matrices.", "Hard"),
        ("What is Prefix Tuning?",
         ["Adding learnable continuous virtual prefix vectors to the keys and values of every Transformer layer", "Prefixing every user prompt with 'Please answer honestly:'", "Deleting the first 100 tokens of every document", "Converting all output text into JSON strings"],
         "A", "Prefix Tuning prepends learnable, task-specific continuous vectors to the Keys and Values across all attention layers.", "Medium"),
        ("How does Prompt Tuning (Lester et al., 2021) differ from Prefix Tuning?",
         ["Prompt Tuning adds learnable soft prompt virtual tokens only to the input embedding layer, rather than every transformer layer", "Prompt Tuning updates all model parameters", "Prompt Tuning modifies only the last linear layer", "Prompt Tuning cannot be used with transformers"],
         "A", "Prompt Tuning injects tunable continuous virtual tokens strictly at the input embedding sequence level.", "Medium"),
        ("What is Instruction Fine-Tuning (IFT)?",
         ["Training models on prompt-response pairs formatted as explicit instructions to follow user intent", "Compiling LLM code into x86 machine instructions", "Writing user manuals for neural networks", "Teaching LLMs how to play chess only"],
         "A", "Instruction tuning trains base models on structured (instruction, input, output) datasets so they behave as helpful assistants.", "Easy"),
        ("What is 'catastrophic forgetting' during full fine-tuning of LLMs?",
         ["The GPU loses power and drops unsaved checkpoint files", "The model loses general capabilities and knowledge learned during pre-training when updated heavily on a narrow task", "The tokenizer forgets punctuation marks", "The model output becomes completely blank"],
         "B", "Catastrophic forgetting occurs when gradient updates on a specialized dataset overwrite foundational knowledge.", "Medium"),
        ("What is Supervised Fine-Tuning (SFT) in the standard LLM post-training pipeline?",
         ["The first stage after pre-training where models are trained on curated demonstrations of desired assistant behavior", "A technique where humans write code live in the GPU", "A method to calculate corporate payroll", "A training process that uses no labels or human data"],
         "A", "SFT fine-tunes pre-trained models on high-quality demonstrative dialogues before reinforcement learning alignment.", "Easy"),
        ("Which library developed by Hugging Face is standard for training LoRA and adapter configurations?",
         ["peft", "numpy", "pandas", "requests"],
         "A", "The Hugging Face `peft` library is the industry standard for configuring and training PEFT methods like LoRA.", "Easy"),
        ("Why can LoRA adapters be merged back into original base model weights for zero-overhead inference?",
         ["Because matrix addition W_final = W_base + (B * A) is linear and can be pre-computed before deployment", "Because adapters delete the original base model", "Because LoRA runs in JavaScript inside the browser", "Because GPUs don't support matrix multiplication"],
         "A", "Since W_new = W_0 + (alpha/r)*B*A, the products can be added directly into W_0, eliminating runtime latency.", "Medium"),
        ("Full parameter fine-tuning of a 70B parameter model in FP16 requires approximately how much GPU memory for optimizer states alone (Adam)?",
         ["~8 GB", "~40 GB", "~560 GB to 1 TB+ (due to 16 bytes per parameter across weights, gradients, and first/second Adam moments)", "~10 MB"],
         "C", "Adam requires 8 bytes per param for moments + 4 bytes for grads + 4 bytes FP32 master weights = 16 bytes/param (~1.1 TB for 70B).", "Hard")
    ]),
    ("Alignment & RLHF (DPO, PPO, Instruction Tuning)", [
        ("What does RLHF stand for in LLM alignment?",
         ["Reinforcement Learning from Human Feedback", "Real-time Logic with Hardware Filtering", "Recursive Language Heuristics Framework", "Relational Learning with Hyperparameter Tuning"],
         "A", "RLHF stands for Reinforcement Learning from Human Feedback, steering model outputs to match human preferences.", "Easy"),
        ("What are the '3 Hs' of AI alignment popularized by Anthropic?",
         ["Helpful, Honest, Harmless", "Heavy, High-speed, Heuristic", "Hardware, Hybrid, Hostile", "Human-level, Hyper-parameterized, High-yield"],
         "A", "The 3 Hs characterize desirable aligned assistant behavior: being Helpful, Honest, and Harmless.", "Easy"),
        ("In traditional RLHF (Christiano et al., 2017 / InstructGPT), what is the role of the Reward Model?",
         ["To generate random prompt questions", "To predict a scalar reward score indicating human preference given a prompt and candidate response", "To punish users who ask difficult questions", "To measure GPU thermal temperature"],
         "B", "A reward model is trained on human pairwise preference comparisons to assign scalar scores to model generations.", "Medium"),
        ("Which reinforcement learning algorithm was predominantly used in early RLHF pipelines (e.g., InstructGPT, ChatGPT)?",
         ["PPO (Proximal Policy Optimization)", "Q-Learning (tabular)", "SARSA", "Monte Carlo Tree Search with Minimax only"],
         "A", "PPO is the policy gradient algorithm widely used to update language model policy weights based on reward model feedback.", "Medium"),
        ("Why is a KL-divergence penalty added to the RLHF optimization objective?",
         ["To speed up network data transfer rates", "To prevent the policy model from drifting too far from the initial SFT model and exploiting the reward model ('reward hacking')", "To force the model to output shorter answers", "To prevent the model from using English words"],
         "B", "The KL penalty D_KL(pi_theta || pi_ref) prevents 'reward hacking' where the model produces gibberish that tricks the reward model.", "Hard"),
        ("Direct Preference Optimization (DPO, Rafailov et al., 2023) improves upon standard RLHF by:",
         ["Deriving a closed-form substitution that optimizes the policy directly on preference data without training a separate reward model or using RL loops", "Adding 10 additional reward models in an ensemble", "Replacing neural networks with decision trees", "Requiring 100x more GPU clusters"],
         "A", "DPO mathematically reparameterizes the reward model in terms of the policy, allowing direct cross-entropy optimization on preference pairs.", "Hard"),
        ("In preference datasets for alignment, each training instance typically consists of:",
         ["A prompt, a chosen (preferred) response, and a rejected (dispreferred) response", "A single word and its dictionary definition", "An image and its RGB pixel coordinates", "A Python compiler error log"],
         "A", "Preference pairs consist of a prompt x along with a chosen response y_w and a rejected response y_l.", "Easy"),
        ("What is 'Jailbreaking' in the context of aligned LLMs?",
         ["Rooting an iPhone using iOS exploits", "Crafting adversarial prompts that bypass safety guardrails and force the model to generate prohibited content", "Running an LLM on an unsupported operating system", "Cracking the encryption of the model checkpoint"],
         "B", "Jailbreaking uses adversarial framing, roleplay, or encoding to trick safety-aligned models into violating policy.", "Easy"),
        ("What is 'Sycophancy' in aligned language models?",
         ["The tendency of a model to agree with the user's stated opinion or bias, even when factually incorrect", "The model speaking only in ancient Greek", "The model crashing when handling numeric tables", "The model refusing to reply to polite greetings"],
         "B", "Sycophancy refers to models tailoring answers to flatter or confirm user prejudices rather than stating objective truths.", "Medium"),
        ("What is Constitutional AI (RLAIF) developed by Anthropic?",
         ["A legal system where judges are replaced with LLMs", "An alignment method where the model critiques and refines its own responses using a written set of principles (a constitution) rather than human feedback", "A method to train models only on national constitutions", "A government law mandating open weights for all models"],
         "B", "Constitutional AI replaces human feedback loops with AI feedback guided by written behavioral principles and self-critiques.", "Hard"),
        ("KTO (Kahneman-Tversky Optimization) differs from DPO by:",
         ["Aligning models directly using unpaired binary feedback (thumbs up / thumbs down) inspired by behavioral prospect theory", "Requiring 10-way ranking tournaments", "Using exclusively quadratic regression", "Excluding all safety guidelines"],
         "A", "KTO operates on unpaired signal data (whether an individual response is desirable or undesirable) using prospect theory principles.", "Hard"),
        ("What is 'Reward Hacking' or 'Goodhart's Law' in AI alignment?",
         ["When a measure becomes a target, it ceases to be a good measure — the model finds degenerate ways to maximize the reward model score without fulfilling the true intent", "When hackers steal the model weights from the server", "When human annotators demand higher wages", "When the training loss hits exactly zero"],
         "A", "Reward hacking occurs when policies optimize proxy rewards via unintended loopholes (e.g., generating repetitive pleasantries).", "Medium")
    ]),
    ("Prompt Engineering & In-Context Learning", [
        ("What is 'Zero-Shot' prompting?",
         ["Feeding zero tokens to the model and expecting output", "Asking the model to perform a task with instructions only, without providing any input-output examples", "Training the model from scratch with zero parameters", "Running an LLM with zero electrical power"],
         "B", "Zero-shot prompting gives the model a direct instruction or question without supplying demonstration examples.", "Easy"),
        ("Few-Shot prompting (In-Context Learning) involves:",
         ["Fine-tuning model weights with backpropagation on 3 examples", "Providing a few input-output demonstration examples directly within the context window prompt", "Prompting the model only 3 times a day", "Deleting few layers from the transformer model"],
         "B", "Few-shot prompting provides exemplars inside the prompt context to steer format and task behavior without updating model weights.", "Easy"),
        ("What is Chain-of-Thought (CoT) prompting (Wei et al., 2022)?",
         ["Connecting multiple GPUs in a daisy chain", "Prompting the model to generate intermediate reasoning steps before arriving at a final answer ('Let's think step by step')", "Encrypting prompts with blockchain hashes", "Limiting the model to generating only one word at a time"],
         "B", "Chain-of-Thought prompting induces explicit reasoning trajectories, significantly improving multi-step math and logic solving.", "Easy"),
        ("What is the 'Lost in the Middle' phenomenon in long-context LLMs (Liu et al., 2023)?",
         ["Models fail to download middle chapters of books", "LLMs retrieve and reason over information located at the beginning or end of long prompts far better than information in the middle", "Middle-aged engineers write poorer prompts", "Transformers skip attention for tokens located in the middle of a sentence"],
         "B", "Empirical studies show LLM performance degrades severely when relevant facts are situated in the middle of long context windows.", "Medium"),
        ("What is Tree-of-Thoughts (ToT) prompting framework?",
         ["Generating a single linear paragraph of text", "Exploring multiple reasoning paths over tree-like decision structures with lookahead and backtracking", "Converting text into binary search trees for sorting", "Using Decision Trees instead of Deep Neural Networks"],
         "B", "Tree-of-Thoughts allows models to deliberate over multiple distinct reasoning branches, evaluate progress, and backtrack.", "Hard"),
        ("What is Prompt Injection?",
         ["A security vulnerability where untrusted external user input manipulates the LLM into ignoring system instructions and executing rogue commands", "Inserting SQL queries into database tables directly", "Injecting electrical signals into GPU transistors", "Updating system RAM with faster DDR5 memory"],
         "A", "Prompt injection occurs when user data overrides developer system prompts to hijack model behavior.", "Easy"),
        ("What is the difference between direct and indirect prompt injection?",
         ["Direct injection comes from the user prompt; indirect injection enters via external data ingested by the model (e.g., a poisoned webpage or email)", "Direct injection uses Python; indirect injection uses C++", "Direct injection is harmless; indirect injection breaks the hardware", "There is no difference"],
         "A", "Indirect prompt injection occurs when third-party content (e.g., retrieved web text or PDF) contains hidden hostile instructions.", "Medium"),
        ("How does Self-Consistency decoding improve reasoning in LLMs (Wang et al., 2022)?",
         ["By forcing the model temperature to zero", "By sampling multiple diverse CoT reasoning paths with nonzero temperature and taking the majority vote answer", "By asking the model if it is confident in its answer", "By retraining the model on its own outputs"],
         "B", "Self-consistency generates multiple stochastic reasoning paths and selects the consensus answer via marginalization/majority voting.", "Medium"),
        ("What is the purpose of the 'System Prompt' in ChatML and modern chat APIs?",
         ["To tell the computer operating system which port to open", "To set foundational behavioral guardrails, persona, tone, and operational boundaries for the conversation", "To compile Python scripts before running them", "To configure user billing details"],
         "B", "System prompts establish persistent instructions and persona constraints governing assistant behavior throughout the session.", "Easy"),
        ("Which decoding parameter controls the randomness of token selection by scaling logits prior to softmax?",
         ["Temperature", "Learning Rate", "Batch Size", "Weight Decay"],
         "A", "Temperature scales logits (z_i / T); higher T flattens the distribution for creative diversity, while T->0 approaches greedy decoding.", "Easy"),
        ("What does Top-p (Nucleus) sampling do?",
         ["Samples only from the top p% of all model weights", "Samples only from the smallest set of tokens whose cumulative probability exceeds threshold p", "Samples exactly p tokens per sentence", "Rejects any token containing the letter 'p'"],
         "B", "Nucleus sampling dynamically cuts off the long tail of low-probability tokens by truncating when cumulative sum reaches p.", "Medium"),
        ("What is ReAct (Reason + Act) prompting framework (Yao et al., 2022)?",
         ["A JavaScript UI framework for displaying chatbots", "A paradigm combining reasoning traces (thoughts) and task-specific actions (e.g., API calls, searches) in an interleaved loop", "A method to suppress all emotional words in responses", "A technique to compile React components using Python"],
         "B", "ReAct interleaves reasoning ('Thought') with action ('Action: Search[...]') and observations to solve complex interactive tasks.", "Hard")
    ]),
    ("LLM Evaluation, Hallucination & Ethics", [
        ("What is 'hallucination' in the context of Large Language Models?",
         ["When the model experiences hardware GPU thermal overthrottling", "When the model generates plausible-sounding statements that are factually false, unfaithful, or unsupported by evidence", "When the user hallucinates while reading responses", "When the model outputs text in colorful fonts"],
         "B", "Hallucination occurs when an LLM produces confident, coherent, yet factually untrue or fabricated assertions.", "Easy"),
        ("What is the MMLU (Massive Multitask Language Understanding) benchmark used for?",
         ["Measuring GPU memory bandwidth during training", "Evaluating cross-domain knowledge and reasoning across 57 subjects ranging from elementary math to professional law and medicine", "Testing optical character recognition on scanned PDFs", "Benchmarking audio transcription accuracy"],
         "B", "MMLU is an industry-standard benchmark spanning 57 academic subjects to measure general knowledge and reasoning.", "Easy"),
        ("What does GSM8K benchmark test?",
         ["Grammar and spelling metrics in 8,000 documents", "Grade school math multi-step word problem reasoning", "Global social media sentiment trends", "Speech recognition on 8,000 audio clips"],
         "B", "GSM8K comprises 8,500 grade school math word problems requiring multi-step arithmetic and natural language reasoning.", "Easy"),
        ("HumanEval benchmark developed by OpenAI evaluates:",
         ["Functional correctness of Python code generation based on unit test pass rates (pass@k)", "Human emotional intelligence during therapy chat", "Medical diagnosis accuracy on radiology images", "Grammatical correctness of poetry translations"],
         "A", "HumanEval evaluates code synthesis on 164 Python coding challenges verified by rigorous unit test execution.", "Medium"),
        ("What is 'LLM-as-a-Judge' evaluation methodology (e.g., MT-Bench, AlpacaEval)?",
         ["Appointing neural networks as judges in civil courtrooms", "Using a strong frontier LLM (e.g., GPT-4) to grade and compare model responses against reference criteria or pairwise baselines", "Letting the model write its own evaluation benchmarks", "Grading models based on line count of generated text"],
         "B", "LLM-as-a-Judge employs high-capability models to evaluate quality, coherence, and instruction following at scale.", "Medium"),
        ("Which bias is common when using LLM-as-a-Judge for pairwise evaluations?",
         ["Position bias (preferring whichever candidate response is presented first)", "Verbosity bias (preferring longer, more verbose responses regardless of quality)", "Self-enhancement bias (preferring responses generated by the judge's own model family)", "All of the above"],
         "D", "LLM judges exhibit well-documented biases including position bias, verbosity bias, and self-preference bias.", "Hard"),
        ("What is the difference between intrinsic and extrinsic hallucination in summarization tasks?",
         ["Intrinsic directly contradicts information in the source document; extrinsic introduces claims that cannot be verified from the source", "Intrinsic is harmless; extrinsic causes hardware errors", "Intrinsic happens on GPUs; extrinsic happens on CPUs", "There is no difference"],
         "A", "Intrinsic hallucination asserts facts conflicting with the prompt text; extrinsic hallucination adds unverifiable outside facts.", "Hard"),
        ("Why is exact-string match accuracy (EM) inadequate for evaluating open-ended generative tasks?",
         ["Because valid answers can be phrased in thousands of semantically equivalent variations not matching the single ground truth string", "Because computers cannot compare strings", "Because EM is computationally impossible on GPUs", "Because open-ended tasks only generate images"],
         "A", "Language allows infinite paraphrasing; an accurate answer may not match the exact reference characters.", "Easy"),
        ("What is BOLD (Bias in Open-Ended Language Generation Dataset) designed to evaluate?",
         ["Model generation speed across server locations", "Fairness and demographic biases across gender, race, religion, and professions", "The maximum token length supported by attention layers", "The financial cost of running API calls"],
         "B", "BOLD benchmarks social bias and representation across diverse demographic domains in open-ended generation.", "Medium"),
        ("What does the 'pass@k' metric measure in code and formal generation benchmarks?",
         ["The probability that at least one of the k generated candidate samples passes all unit test testcases", "The percentage of students who pass a computer science exam", "The number of tokens generated per millisecond", "The percentage of lines that contain comments"],
         "B", "pass@k calculates the probability that among k independently sampled code solutions, at least one passes unit tests.", "Medium"),
        ("What is TruthfulQA benchmark specifically constructed to measure?",
         ["How fast a model can search Google", "How often a model mimics human falsehoods, common myths, and conspiracy theories versus stating verified facts", "The quantum physics proficiency of models", "The grammar accuracy in Shakespearean plays"],
         "B", "TruthfulQA tests whether language models mimic widespread human superstitions, false beliefs, and conspiracy theories.", "Medium"),
        ("Which mitigation technique significantly reduces factual hallucination in factual query answering?",
         ["Retrieval-Augmented Generation (RAG) grounding responses in retrieved authoritative documents", "Increasing temperature to 2.0", "Deleting system prompts completely", "Disabling attention layers"],
         "A", "RAG anchors model generation in external, retrieved factual evidence, drastically reducing ungrounded hallucinations.", "Easy")
    ]),
    ("Retrieval-Augmented Generation (RAG) & Agentic Workflows", [
        ("What is the core architecture of Retrieval-Augmented Generation (RAG)?",
         ["Fine-tuning a billion parameter model on every single user query", "Retrieving relevant documents from an external knowledge store and passing them as context inside the LLM prompt", "Storing all company data directly inside transformer neural weights", "Using speech synthesis to read text out loud"],
         "B", "RAG retrieves relevant external documents via vector search and includes them in the context prompt for grounded generation.", "Easy"),
        ("In vector search for RAG, what metric is most commonly used to compute similarity between dense embeddings?",
         ["Cosine Similarity (or inner dot product of normalized vectors)", "Hamming distance on ASCII strings", "Levenshtein edit distance", "Mean Absolute Error"],
         "A", "Cosine similarity measures the cosine of the angle between two dense semantic embedding vectors in latent space.", "Easy"),
        ("What is 'Chunking' in a RAG ingestion pipeline?",
         ["Throwing away 50% of files at random", "Breaking large documents into smaller, semantically coherent segments suitable for embedding and context retrieval", "Renaming files with numeric prefixes", "Translating text into hexadecimal strings"],
         "B", "Chunking divides large text corpora into manageable pieces that respect embedding model token limits and optimize retrieval focus.", "Easy"),
        ("What is a Vector Database (e.g., Pinecone, Chroma, Milvus, Qdrant)?",
         ["A relational database that only accepts SVG vector images", "A specialized database designed for indexing, storing, and fast nearest-neighbor search over high-dimensional vector embeddings", "A spreadsheet software like Microsoft Excel", "A hardware processor inside GPU clusters"],
         "B", "Vector databases index high-dimensional embeddings to perform ultra-fast approximate nearest neighbor (ANN) retrieval.", "Easy"),
        ("How does HNSW (Hierarchical Navigable Small World) improve vector search performance?",
         ["By performing brute-force exact comparison across all billion vectors", "By building a multi-layer graph index for fast approximate nearest neighbor (ANN) search with logarithmic time complexity", "By compressing all text into 1-bit integers", "By deleting 90% of index nodes"],
         "B", "HNSW organizes vector indices into hierarchical skip-list graphs to deliver fast approximate nearest neighbor search.", "Hard"),
        ("What is Hybrid Search in modern RAG systems?",
         ["Searching across both desktop and mobile devices", "Combining dense semantic retrieval (vector embeddings) with sparse keyword retrieval (BM25) using reciprocal rank fusion", "Searching text and audio files simultaneously", "Using two different web browsers"],
         "B", "Hybrid search fuses sparse lexical search (BM25 for exact codes/names) and dense semantic vectors for optimal recall.", "Medium"),
        ("What is the function of a Cross-Encoder Reranker in an advanced RAG pipeline?",
         ["To embed documents into vector databases", "To jointly score the query and each candidate passage through full cross-attention to re-order the top retrieved chunks accurately", "To translate English documents into foreign languages", "To encrypt user search queries"],
         "B", "Rerankers apply joint cross-attention over (query, document) pairs to dramatically refine the relevance ranking of candidates.", "Medium"),
        ("What is 'Tool Calling' or 'Function Calling' in agentic LLMs?",
         ["The LLM generating a structured output (like JSON) specifying a function name and arguments to invoke an external API or tool", "The LLM calling a telephone customer service representative", "A programmer calling the LLM from a Python terminal", "A hardware crash error code"],
         "A", "Tool calling enables models to output structured invocation payloads (e.g., function name, args) to execute external software tools.", "Easy"),
        ("In an autonomous agent loop, what are the core components often structured around?",
         ["Planning, Memory, Tool Use, and Reflection/Action Execution", "Accounting, Payroll, Shipping, and Invoicing", "HTML, CSS, JavaScript, and Webpack", "Microphone, Speaker, Monitor, and Keyboard"],
         "A", "AI agents integrate planning (decomposition), memory (short-term context & long-term vector retrieval), tools, and self-reflection.", "Medium"),
        ("What does the 'Self-Refine' pattern enable in an LLM agent workflow?",
         ["The agent generates an initial draft, critiques its own output against constraints, and iteratively rewrites to improve quality", "The agent shuts itself down after 5 minutes", "The agent deletes user prompt history", "The agent asks for financial compensation"],
         "A", "Self-Refine allows agents to iteratively inspect intermediate work product, identify flaws, and rewrite improved versions.", "Easy"),
        ("What is the primary vulnerability of Naive RAG without reranking or metadata filtering?",
         ["Retrieving irrelevant or noisy chunks that distract the LLM, introduce conflicting information, or trigger hallucination", "Overheating the computer motherboard", "Exceeding the maximum RAM of the internet", "Accidental deletion of source database files"],
         "A", "Naive semantic retrieval can pull irrelevant chunks that pollute context, causing the LLM to synthesize flawed or distracted answers.", "Medium"),
        ("What is Multi-Agent Collaboration (e.g., AutoGen, CrewAI)?",
         ["Multiple humans writing prompts simultaneously", "Multiple specialized LLM agents assuming distinct roles (e.g., researcher, coder, reviewer) and conversing to solve complex multi-step tasks", "Running the same LLM on two different computers", "A software license allowing multiple users"],
         "B", "Multi-agent frameworks coordinate specialized agents with unique personas and toolkits to cooperatively accomplish complex goals.", "Easy"),
        ("How does HyDE (Hypothetical Document Embeddings) enhance dense passage retrieval in RAG?",
         ["By asking the LLM to generate a hypothetical answer to the query first, then using that document's embedding to search for real passages", "By deleting questions that have no answers", "By indexing only fictional novels", "By encrypting document vectors with private keys"],
         "A", "HyDE generates a zero-shot pseudo-document to bridge semantic distance between concise queries and long factual passages.", "Hard"),
        ("What is GraphRAG and how does it advance conventional vector-based chunk retrieval?",
         ["It relies solely on pie charts and bar graphs", "It constructs knowledge graphs of entities and relationships across documents to answer complex global, multi-hop queries", "It replaces LLMs with graphics processing units", "It limits retrieval to image files only"],
         "B", "GraphRAG extracts semantic entities and community summaries into knowledge graphs, excelling at holistic sensemaking questions.", "Hard"),
        ("In agentic workflows, what is the role of a state graph (as in LangGraph)?",
         ["To track and persist agent memory, decision nodes, tool results, and conditional routing over multi-turn cycles", "To draw flowchart diagrams on the user's screen", "To monitor GPU fan speeds", "To terminate network connections when errors occur"],
         "A", "State graphs define cyclic workflows where agent states evolve, branch conditionally, and loop until tasks finish.", "Medium")
    ])
]

def build_course_json(course_id, topic_list, base_id_prefix):
    questions = []
    q_counter = 1
    for topic_name, q_specs in topic_list:
        for q_text, options_text, correct_letter, explanation, difficulty in q_specs:
            q_id = f"{base_id_prefix}{q_counter:03d}"
            opts = []
            for idx, text in enumerate(options_text):
                opt_id = chr(ord('A') + idx)
                opts.append({"id": opt_id, "text": text})
            
            q_obj = {
                "id": q_id,
                "courseId": course_id,
                "topic": topic_name,
                "difficulty": difficulty,
                "sourceType": "Course-Aligned Practice Question",
                "question": q_text,
                "options": opts,
                "correctOptionId": correct_letter,
                "explanation": explanation
            }
            questions.append(q_obj)
            q_counter += 1
            
    return {"courseId": course_id, "totalQuestions": len(questions), "questions": questions}



# Generate LLM questions
llm_data = build_course_json("llm", llm_topics, "LLM")
with open("src/data/llmQuestions.json", "w", encoding="utf-8") as f:
    json.dump(llm_data, f, indent=2, ensure_ascii=False)
print(f"Generated {len(llm_data['questions'])} LLM questions.")

