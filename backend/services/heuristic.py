import re

_FACTUAL_PATTERNS = [
    r"\b(is|are|was|were|will be|has|have|had)\b",
    r"\b(in \d{4}|on \w+ \d+|\d+ (percent|%|meters?|km|miles?|years?))\b",
    r"\b(according to|research shows?|studies? (show|found|suggest))\b",
    r"\b(the (first|last|largest|smallest|oldest|newest|only))\b",
    r"\b(founded|invented|discovered|created|built|established)\b",
    r"\b(located in|headquartered in|based in)\b",
    r"\$[\d,]+|\b\d+[\d,]* (billion|million|thousand)\b",
]

_OPINION_STARTERS = [
    r"^(i think|i believe|in my opinion|it depends|that'?s (a great|an interesting))",
    r"^(sure!|of course!|absolutely!|great question)",
    r"^(here are some (tips|ways|ideas|suggestions))",
]

_COMPILED_FACTUAL = [re.compile(p, re.IGNORECASE) for p in _FACTUAL_PATTERNS]
_COMPILED_OPINION = [re.compile(p, re.IGNORECASE) for p in _OPINION_STARTERS]


def is_factual(text: str) -> bool:
    """Return True if the text makes factual assertions worth checking."""
    if len(text.split()) < 10:
        return False

    for pattern in _COMPILED_OPINION:
        if pattern.search(text[:120]):
            return False

    matches = sum(1 for p in _COMPILED_FACTUAL if p.search(text))
    return matches >= 2
