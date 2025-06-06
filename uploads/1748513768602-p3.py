class MaxMatchTokenizer:
    def __init__(self, dictionary):
        self.dictionary = set(dictionary)  # Convert list to a set for O(1) lookup
        self.max_word_length = max(map(len, dictionary))  # Get max word length
        print(self.max_word_length)


    def tokenize(self, text):
        tokens = []
        i = 0
        while i < len(text):
            found = False
            for j in range(min(self.max_word_length, len(text) - i), 0, -1):  # Try longest match first
                word = text[i:i + j]
                if word in self.dictionary:
                    tokens.append(word)
                    i += j  # Move forward
                    found = True
                    break
            if not found:  # If no match, take a single character
                tokens.append(text[i])
                i += 1
        return tokens

# Example Dictionary
dictionary = {"the", "dog", "runs", "fast", "run", "s", "fa", "st"}

# Example Usage  
tokenizer = MaxMatchTokenizer(dictionary)
text = "thedogrunsfastedwf"
tokens = tokenizer.tokenize(text)
print(tokens)  # Output: ['the', 'dog', 'runs', 'fast']
