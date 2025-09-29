import { Box, Avatar, Text, Stack, useBreakpointValue } from "@chakra-ui/react";
import Marquee from "react-fast-marquee";

const testimonials = [
  {
    name: "Chiamaka O.",
    role: "Data Analyst",
    feedback:
      "MPAC ICT HUB transformed my career! Hands-on training in Python and Data Analytics gave me the confidence to land my first tech job within months.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "David O.",
    role: "Cybersecurity Enthusiast",
    feedback:
      "From Cybersecurity to AI, MPAC offers diverse courses with real-world projects that helped me build my portfolio.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Amaka A.",
    role: "UI/UX Designer",
    feedback:
      "I never imagined I could design my own app until I joined MPAC. Creative, fun, and supportive environment!",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const Testimonial = ({ testimonialsRef }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box ref={testimonialsRef} bg="primary" opacity={0.9} py={8}>
      <Text
        fontSize={isMobile ? "xl" : "2xl"}
        fontWeight="bold"
        textAlign="center"
        color="white"
        mb={6}>
        What Our Students Say
      </Text>

      <Marquee pauseOnHover gradient={false} speed={50}>
        {testimonials.map((t, index) => (
          <Box
            key={index}
            bg="whiteAlpha.400"
            p={6}
            mx={4}
            minW="300px"
            rounded="lg"
            shadow="md">
            <Stack spacing={4} align="center" textAlign="center">
              <Avatar.Root>
                <Avatar.Fallback name={t.name} />
                <Avatar.Image src={t.avatar} />
              </Avatar.Root>

              <Text fontWeight="semibold" color="white">
                {t.name}
              </Text>
              <Text fontSize="sm" fontWeight={"semibold"} color="white">
                {t.role}
              </Text>
              <Text fontSize="sm" color="white">
                "{t.feedback}"
              </Text>
            </Stack>
          </Box>
        ))}
      </Marquee>
    </Box>
  );
};

export default Testimonial;
