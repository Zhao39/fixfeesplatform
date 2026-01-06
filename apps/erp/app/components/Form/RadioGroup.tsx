import { Radios } from "@carbon/form";

type RadioGroupProps = {
  name: string;
  label?: string;
  options: { label: string; value: string; description?: string }[];
  orientation?: "horizontal" | "vertical";
};

const RadioGroup = ({
  name,
  label,
  options,
  orientation = "vertical"
}: RadioGroupProps) => {
  // Filter out description field as Radios doesn't support it
  const radioOptions = options.map(({ label, value }) => ({ label, value }));

  return (
    <Radios
      name={name}
      label={label}
      options={radioOptions}
      orientation={orientation}
    />
  );
};

export default RadioGroup;
