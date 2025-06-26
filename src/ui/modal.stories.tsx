// @ts-nocheck

import { ComponentMeta, ComponentStory } from "@storybook/react";
import * as React from "react";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";

export default {
  title: "UI/Modal",
  component: Modal,
  args: {
    title: "Storybook Modal",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["center", "sheet"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "full"],
    },
  },
} as ComponentMeta<typeof Modal>;

const Template: ComponentStory<typeof Modal> = (args) => {
  const [open, setOpen] = React.useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        showDefaultActions
        onConfirm={() => alert("Confirmed!")}
      >
        <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque euismod.</p>
      </Modal>
    </>
  );
};

export const Center = Template.bind({});
Center.args = {
  variant: "center",
  size: "md",
};

export const Sheet = Template.bind({});
Sheet.args = {
  variant: "sheet",
}; 