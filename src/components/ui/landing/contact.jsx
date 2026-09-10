import {
  Box,
  Text,
  Flex,
  Input,
  Textarea,
  Button,
  Stack,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaSchool,
  FaWhatsapp,
  FaCheckCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { useState } from "react";
import { toaster } from "../toaster";

const Contact = ({ contactRef }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim())
      newErrors.message = "Please include a brief message or requirements";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toaster.create({
        title: "Inquiry Received! 🚀",
        description: "Our school partnership team will contact you within 24 hours.",
        type: "success",
      });
      setFormData({
        name: "",
        email: "",
        organization: "",
        message: "",
      });
    }, 600);
  };

  const handleWhatsApp = () => {
    if (!formData.name || !formData.message) {
      toaster.create({
        title: "Please enter your name and message first",
        type: "info",
      });
      return;
    }
    const text = encodeURIComponent(
      `Hello AceSmart Team, my name is ${formData.name} from ${
        formData.organization || "an educational institution"
      }. ${formData.message}`
    );
    window.open(`https://wa.me/2349038561058?text=${text}`, "_blank");
  };

  return (
    <Box
      ref={contactRef}
      py={20}
      bg="linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)"
    >
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 1, lg: 12 }} gap={12} alignItems="center">
          
          {/* Left Side: Brand Value & Direct Channels */}
          <Box gridColumn={{ lg: "span 5" }}>
            <Text
              fontSize="12px"
              fontWeight="800"
              color="#6A1B9A"
              letterSpacing="1px"
              textTransform="uppercase"
              mb={2}
            >
              Institutional Partnerships
            </Text>
            <Text
              as="h2"
              fontSize={{ base: "30px", md: "40px" }}
              fontWeight="800"
              color="gray.900"
              fontFamily="'Outfit', sans-serif"
              letterSpacing="-0.5px"
              lineHeight="1.2"
              mb={5}
            >
              Deploy AceSmart in Your School or Academy
            </Text>
            <Text fontSize="16px" color="gray.600" lineHeight="1.6" mb={8}>
              Whether you need automated mock examinations, student continuous
              assessment, or an isolated CBT center software setup, our academic
              team is ready to assist you.
            </Text>

            {/* Direct Channel Cards */}
            <Stack gap={4} mb={8}>
              <Flex
                align="center"
                gap={4}
                p={4}
                borderRadius="xl"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="0 2px 8px rgba(0,0,0,0.02)"
              >
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="lg"
                  bg="purple.50"
                  color="#6A1B9A"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaEnvelope} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="12px" color="gray.500" fontWeight="600">
                    Direct Email Support
                  </Text>
                  <Text fontSize="15px" fontWeight="700" color="gray.900">
                    support@acesmart.site
                  </Text>
                </Box>
              </Flex>

              <Flex
                align="center"
                gap={4}
                p={4}
                borderRadius="xl"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="0 2px 8px rgba(0,0,0,0.02)"
              >
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="lg"
                  bg="green.50"
                  color="#10B981"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaWhatsapp} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="12px" color="gray.500" fontWeight="600">
                    WhatsApp Desk & Fast Response
                  </Text>
                  <Text fontSize="15px" fontWeight="700" color="gray.900">
                    +234 903 856 1058
                  </Text>
                </Box>
              </Flex>

              <Flex
                align="center"
                gap={4}
                p={4}
                borderRadius="xl"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="0 2px 8px rgba(0,0,0,0.02)"
              >
                <Flex
                  w="44px"
                  h="44px"
                  borderRadius="lg"
                  bg="blue.50"
                  color="#3B82F6"
                  align="center"
                  justify="center"
                >
                  <Icon as={FaSchool} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="12px" color="gray.500" fontWeight="600">
                    Onboarding Assistance
                  </Text>
                  <Text fontSize="15px" fontWeight="700" color="gray.900">
                    Custom Setup for Schools & Centers
                  </Text>
                </Box>
              </Flex>
            </Stack>

            {/* Quick Guarantees */}
            <Flex direction="column" gap={2}>
              <Flex align="center" gap={2}>
                <Icon as={FaCheckCircle} color="#10B981" boxSize={4} />
                <Text fontSize="13px" color="gray.600">
                  Complimentary staff & teacher onboarding training
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Icon as={FaCheckCircle} color="#10B981" boxSize={4} />
                <Text fontSize="13px" color="gray.600">
                  Full access to 50,000+ Nigerian past questions repository
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* Right Side: High Converting Inquiry Form */}
          <Box gridColumn={{ lg: "span 7" }}>
            <Box
              bg="white"
              borderRadius="28px"
              p={{ base: 6, sm: 8, md: 10 }}
              border="1px solid"
              borderColor="gray.200"
              boxShadow="0 18px 40px -10px rgba(106, 27, 154, 0.08)"
            >
              <Text
                fontSize="24px"
                fontWeight="800"
                color="gray.900"
                fontFamily="'Outfit', sans-serif"
                mb={1}
              >
                Request an Institutional Demo
              </Text>
              <Text fontSize="14px" color="gray.500" mb={6}>
                Fill out the details below and we will prepare a customized CBT demo for your school.
              </Text>

              <form onSubmit={handleSubmit}>
                <Stack gap={4}>
                  {/* Name */}
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="gray.700" mb={1.5}>
                      Full Name *
                    </Text>
                    <Input
                      name="name"
                      placeholder="e.g. Dr. Emmanuel Adeleke"
                      value={formData.name}
                      onChange={handleChange}
                      borderRadius="xl"
                      borderColor={errors.name ? "red.400" : "gray.200"}
                      _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                      h="46px"
                      fontSize="14px"
                    />
                    {errors.name && (
                      <Text color="red.500" fontSize="12px" mt={1}>
                        {errors.name}
                      </Text>
                    )}
                  </Box>

                  {/* Email & Phone */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                    <Box>
                      <Text fontSize="13px" fontWeight="700" color="gray.700" mb={1.5}>
                        Email Address *
                      </Text>
                      <Input
                        type="email"
                        name="email"
                        placeholder="emmanuel@school.edu.ng"
                        value={formData.email}
                        onChange={handleChange}
                        borderRadius="xl"
                        borderColor={errors.email ? "red.400" : "gray.200"}
                        _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                        h="46px"
                        fontSize="14px"
                      />
                      {errors.email && (
                        <Text color="red.500" fontSize="12px" mt={1}>
                          {errors.email}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontSize="13px" fontWeight="700" color="gray.700" mb={1.5}>
                        School or Institution Name
                      </Text>
                      <Input
                        name="organization"
                        placeholder="e.g. St. Gregory's College"
                        value={formData.organization}
                        onChange={handleChange}
                        borderRadius="xl"
                        borderColor="gray.200"
                        _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                        h="46px"
                        fontSize="14px"
                      />
                    </Box>
                  </SimpleGrid>

                  {/* Message */}
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="gray.700" mb={1.5}>
                      How can we assist your institution? *
                    </Text>
                    <Textarea
                      name="message"
                      placeholder="Share estimated number of students, upcoming exam dates, or specific CBT requirements..."
                      value={formData.message}
                      onChange={handleChange}
                      borderRadius="xl"
                      borderColor={errors.message ? "red.400" : "gray.200"}
                      _focus={{ borderColor: "#6A1B9A", boxShadow: "0 0 0 1px #6A1B9A" }}
                      rows={4}
                      fontSize="14px"
                    />
                    {errors.message && (
                      <Text color="red.500" fontSize="12px" mt={1}>
                        {errors.message}
                      </Text>
                    )}
                  </Box>

                  {/* Action buttons */}
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    gap={3}
                    pt={2}
                  >
                    <Button
                      type="submit"
                      flex={1}
                      bg="linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)"
                      color="white"
                      h="50px"
                      borderRadius="xl"
                      fontSize="15px"
                      fontWeight="700"
                      boxShadow="0 6px 18px rgba(106, 27, 154, 0.25)"
                      _hover={{
                        opacity: 0.95,
                        transform: "translateY(-1px)",
                      }}
                      loading={isSubmitting}
                      loadingText="Sending Request..."
                    >
                      <Icon as={FaPaperPlane} mr={2} boxSize={3.5} />
                      Send Demo Request
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      borderColor="green.500"
                      color="green.600"
                      bg="green.50"
                      h="50px"
                      borderRadius="xl"
                      fontSize="14px"
                      fontWeight="700"
                      _hover={{
                        bg: "green.100",
                        transform: "translateY(-1px)",
                      }}
                      onClick={handleWhatsApp}
                    >
                      <Icon as={FaWhatsapp} mr={2} boxSize={4} color="green.600" />
                      Chat on WhatsApp
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Contact;
