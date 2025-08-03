/*
 * Licensed under GPL-3.0-or-later
 * React component for TagInput.
 */
/* wraps Tagify; lower-cases, strips leading #, max 10 tags */
import Tags from '@yaireo/tagify/dist/react.tagify';

export default function TagInput({
  value,
  setValue,
}: {
  value: string[];
  setValue: (v: string[]) => void;
}) {
  return (
    <Tags
      value={value.join(',')}
      settings={{
        maxTags: 10,
        transformTag(tagData) {
          tagData.value = tagData.value.toLowerCase().replace(/^#/, '');
        },
      }}
      onChange={(e) =>
        setValue(e.detail.tagify.value.map((t: any) => t.value))
      }
    />
  );
}
