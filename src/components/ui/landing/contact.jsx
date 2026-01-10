import {
  Box,
  Text,
  Flex,
  Input,
  Textarea,
  Button,
  Stack,
  Field,
  Fieldset,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaEnvelope, FaPhoneAlt, FaSchool, FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { toaster } from "../toaster";

const Contact = ({ contactRef }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    toaster.create({
      title: "Message ready to be sent!",
    });
  };

  const handleWhatsApp = () => {
    if (!formData.name || !formData.message) {
      toaster.create({ title: "Please enter your name and message first!" });
      return;
    }
    const text = encodeURIComponent(
      `Hello AceSmart, my name is ${formData.name}. ${formData.message}`
    );
    const whatsappLink = `https://wa.me/2349038561058?text=${text}`;
    window.open(whatsappLink, "_blank");
  };

  return (
    <Box ref={contactRef} bg="gray.100" py={16} px={isMobile ? 4 : 20}>
      <Flex
        direction={isMobile ? "column" : "row"}
        gap={10}
        align="flex-start"
        maxW="1200px"
        mx="auto"
      >
        {/* Left Info */}
        <Box cursor="pointer" flex={1}>
          <Text fontSize={isMobile ? "2xl" : "3xl"} fontWeight="bold" mb={4}>
            Get in touch with Ace<span style={{ color: "purple" }}>Smart</span>
          </Text>
          <Text color="gray.600" mb={6}>
            Whether you are a school, teacher, tutorial center, or examination
            body, AceSmart helps you set, manage, and conduct CBT exams
            seamlessly.
          </Text>

          <Stack spacing={4}>
            <Flex align="center" gap={3}>
              <Icon as={FaEnvelope} color="primary" />
              <Text>support@acesmart.site</Text>
            </Flex>
            <Flex align="center" gap={3}>
              <Icon as={FaPhoneAlt} color="primary" />
              <Text>+2349038561058</Text>
            </Flex>
            <Flex align="center" gap={3}>
              <Icon as={FaSchool} color="primary" />
              <Text>Available for schools & exam centers</Text>
            </Flex>
          </Stack>
        </Box>

        {/* Right Form */}
        <Box flex={1} bg="white" p={8} rounded="lg" shadow="md">
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            Request a demo / Send a message
          </Text>

          <Fieldset.Root size="lg" style={{ maxWidth: "100%" }}>
            <Fieldset.Content
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* Name */}
              <Field.Root>
                <Input
                  placeholder="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <Text color="red.500" fontSize="sm">
                    {errors.name}
                  </Text>
                )}
              </Field.Root>

              {/* Email */}
              <Field.Root>
                <Input
                  placeholder="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm">
                    {errors.email}
                  </Text>
                )}
              </Field.Root>

              {/* Organization */}
              <Field.Root>
                <Input
                  placeholder="School / Organization (optional)"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </Field.Root>

              {/* Message */}
              <Field.Root>
                <Textarea
                  placeholder="Tell us how you intend to use AceSmart"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                />
                {errors.message && (
                  <Text color="red.500" fontSize="sm">
                    {errors.message}
                  </Text>
                )}
              </Field.Root>

              {/* Buttons */}
              <Flex gap={4} direction={isMobile ? "column" : "row"}>
                <Button
                  bg="primary"
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  onClick={handleSubmit}
                >
                  Send Message
                </Button>
                <Button
                  leftIcon={<FaWhatsapp />}
                  bg="green.500"
                  color="white"
                  _hover={{ opacity: 0.9 }}
                  onClick={handleWhatsApp}
                >
                  Send via WhatsApp
                </Button>
              </Flex>
            </Fieldset.Content>
          </Fieldset.Root>
        </Box>
      </Flex>
    </Box>
  );
};

export default Contact;
