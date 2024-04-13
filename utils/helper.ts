import matchAll from "string.prototype.matchall";
import { diffChars } from "diff";

const mentionRegEx = /((.)\[([^[]*)]\(([^(^)]*)\))/gi;

export const isMentionPartType = (partType) => {
  return partType.trigger != null;
};

const defaultPlainStringGenerator = ({ trigger }, { name }) =>
  `${trigger}${name}`;

const generateRegexResultPart = (partType, result, positionOffset = 0) => ({
  text: result[0],
  position: {
    start: positionOffset,
    end: positionOffset + result[0].length,
  },
  partType,
});

const generateMentionPart = (mentionPartType, mention, positionOffset = 0) => {
  const text = mentionPartType.getPlainString
    ? mentionPartType.getPlainString(mention)
    : defaultPlainStringGenerator(mentionPartType, mention);

  return {
    text,
    position: {
      start: positionOffset,
      end: positionOffset + text.length,
    },
    partType: mentionPartType,
    data: mention,
  };
};

const getMentionDataFromRegExMatchResult = ([
  ,
  original,
  trigger,
  name,
  id,
]) => ({
  original,
  trigger,
  name,
  id,
});

const generatePlainTextPart = (text, positionOffset = 0) => ({
  text,
  position: {
    start: positionOffset,
    end: positionOffset + text.length,
  },
});

export const parseValue = (value, partTypes, positionOffset = 0) => {
  if (value == null) {
    value = "";
  }

  let plainText = "";
  let parts = [];

  if (partTypes.length === 0) {
    plainText += value;
    parts.push(generatePlainTextPart(value, positionOffset));
  } else {
    const [partType, ...restPartTypes] = partTypes;

    const regex = isMentionPartType(partType) ? mentionRegEx : partType.pattern;

    const matches = Array.from(matchAll(value ?? "", regex));

    if (matches.length === 0) {
      return parseValue(value, restPartTypes, positionOffset);
    }

    if (matches[0].index != 0) {
      const text = value.substr(0, matches[0].index);

      const plainTextAndParts = parseValue(text, restPartTypes, positionOffset);
      parts = parts.concat(plainTextAndParts.parts);
      plainText += plainTextAndParts.plainText;
    }

    for (let i = 0; i < matches.length; i++) {
      const result = matches[i];

      if (isMentionPartType(partType)) {
        const mentionData = getMentionDataFromRegExMatchResult(result);

        if (mentionData.trigger !== partType.trigger) {
          const plainTextAndParts = parseValue(
            mentionData.original,
            restPartTypes,
            positionOffset + plainText.length
          );
          parts = parts.concat(plainTextAndParts.parts);
          plainText += plainTextAndParts.plainText;
        } else {
          const part = generateMentionPart(
            partType,
            mentionData,
            positionOffset + plainText.length
          );

          parts.push(part);

          plainText += part.text;
        }
      } else {
        const part = generateRegexResultPart(
          partType,
          result,
          positionOffset + plainText.length
        );

        parts.push(part);

        plainText += part.text;
      }

      if (result.index + result[0].length !== value.length) {
        const isLastResult = i === matches.length - 1;

        const text = value.slice(
          result.index + result[0].length,
          isLastResult ? undefined : matches[i + 1].index
        );

        const plainTextAndParts = parseValue(
          text,
          restPartTypes,
          positionOffset + plainText.length
        );
        parts = parts.concat(plainTextAndParts.parts);
        plainText += plainTextAndParts.plainText;
      }
    }
  }

  return {
    plainText,
    parts,
  };
};

const getPartIndexByCursor = (parts, cursor, isIncludeEnd) => {
  return parts.findIndex((one) =>
    cursor >= one.position.start && isIncludeEnd
      ? cursor <= one.position.end
      : cursor < one.position.end
  );
};

const getPartsInterval = (parts, cursor, count) => {
  const newCursor = cursor + count;

  const currentPartIndex = getPartIndexByCursor(parts, cursor);
  const currentPart = parts[currentPartIndex];

  const newPartIndex = getPartIndexByCursor(parts, newCursor, true);
  const newPart = parts[newPartIndex];

  let partsInterval = [];

  if (!currentPart || !newPart) {
    return partsInterval;
  }

  if (
    currentPart.position.start === cursor &&
    currentPart.position.end <= newCursor
  ) {
    partsInterval.push(currentPart);
  } else {
    partsInterval.push(
      generatePlainTextPart(
        currentPart.text.substr(cursor - currentPart.position.start, count)
      )
    );
  }

  if (newPartIndex > currentPartIndex) {
    partsInterval = partsInterval.concat(
      parts.slice(currentPartIndex + 1, newPartIndex)
    );

    if (
      newPart.position.end === newCursor &&
      newPart.position.start >= cursor
    ) {
      partsInterval.push(newPart);
    } else {
      partsInterval.push(
        generatePlainTextPart(
          newPart.text.substr(0, newCursor - newPart.position.start)
        )
      );
    }
  }

  return partsInterval;
};

const getValueFromParts = (parts) =>
  parts.map((item) => (item.data ? item.data.original : item.text)).join("");

export const generateValueFromPartsAndChangedText = (
  parts,
  originalText,
  changedText
) => {
  const changes = diffChars(originalText, changedText);

  let newParts = [];

  let cursor = 0;

  changes.forEach((change) => {
    switch (true) {
      case change.removed: {
        cursor += change.count;

        break;
      }
      case change.added: {
        newParts.push(generatePlainTextPart(change.value));

        break;
      }
      default: {
        if (change.count !== 0) {
          newParts = newParts.concat(
            getPartsInterval(parts, cursor, change.count)
          );

          cursor += change.count;
        }

        break;
      }
    }
  });

  return getValueFromParts(newParts);
};

export const getMentionPartSuggestionKeywords = (
  parts,
  plainText,
  selection,
  partTypes
) => {
  const keywordByTrigger = {};

  partTypes
    .filter(isMentionPartType)
    .forEach(({ trigger, allowedSpacesCount = 1 }) => {
      keywordByTrigger[trigger] = undefined;

      if (selection.end != selection.start) {
        return;
      }

      const part = parts.find(
        (one) =>
          selection.end > one.position.start &&
          selection.end <= one.position.end
      );

      if (part == null || part.data != null) {
        return;
      }

      const triggerIndex = plainText.lastIndexOf(trigger, selection.end);

      if (
        triggerIndex == -1 ||
        triggerIndex < part.position.start ||
        (triggerIndex > 0 && !/[\s\n]/gi.test(plainText[triggerIndex - 1]))
      ) {
        return;
      }

      let spacesCount = 0;
      for (
        let cursor = selection.end - 1;
        cursor >= triggerIndex;
        cursor -= 1
      ) {
        if (plainText[cursor] === "\n") {
          return;
        }

        if (plainText[cursor] === " ") {
          spacesCount += 1;

          if (spacesCount > allowedSpacesCount) {
            return;
          }
        }
      }

      keywordByTrigger[trigger] = plainText.substring(
        triggerIndex + 1,
        selection.end
      );
    });

  return keywordByTrigger;
};

const getMentionValue = (trigger, suggestion) =>
  `${trigger}[${suggestion.name}](${suggestion.id})`;

export const generateValueWithAddedSuggestion = (
  parts,
  mentionType,
  plainText,
  selection,
  suggestion
) => {
  const currentPartIndex = parts.findIndex(
    (one) =>
      selection.end >= one.position.start && selection.end <= one.position.end
  );
  const currentPart = parts[currentPartIndex];

  if (!currentPart) {
    return;
  }

  const triggerPartIndex = currentPart.text.lastIndexOf(
    mentionType.trigger,
    selection.end - currentPart.position.start
  );

  const newMentionPartPosition = {
    start: triggerPartIndex,
    end: selection.end - currentPart.position.start,
  };

  const isInsertSpaceToNextPart =
    mentionType.isInsertSpaceAfterMention &&
    (plainText.length === selection.end ||
      parts[currentPartIndex]?.text.startsWith(
        "\n",
        newMentionPartPosition.end
      ));

  return getValueFromParts([
    ...parts.slice(0, currentPartIndex),

    generatePlainTextPart(
      currentPart.text.substring(0, newMentionPartPosition.start)
    ),
    generateMentionPart(mentionType, {
      original: getMentionValue(mentionType.trigger, suggestion),
      trigger: mentionType.trigger,
      ...suggestion,
    }),

    generatePlainTextPart(
      `${isInsertSpaceToNextPart ? " " : ""}${currentPart.text.substring(
        newMentionPartPosition.end
      )}`
    ),

    ...parts.slice(currentPartIndex + 1),
  ]);
};
