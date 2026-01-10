import { Box, Avatar, Text, Stack, useBreakpointValue } from "@chakra-ui/react";
import Marquee from "react-fast-marquee";

const testimonials = [
  {
    name: "Mr. Adewale T.",
    role: "Secondary School Teacher",
    feedback:
      "AceSmart makes setting CBT exams extremely easy. I can create JAMB-style tests for my students, schedule them, and get results instantly without stress.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Miss Zainab K.",
    role: "WAEC Candidate",
    feedback:
      "Practicing on AceSmart feels exactly like the real exam. The timer, question format, and navigation helped me stay confident during my CBT exams.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Mr Samuel O.",
    role: "Private Lesson Tutor",
    feedback:
      "With thousands of questions available, I can easily set different exams for each class. Auto-grading saves me hours every week.",

    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Deborah A.",
    role: "JAMB Aspirant",
    feedback:
      "AceSmart helped me practice past questions under real exam conditions. I improved my speed and accuracy before the actual CBT.",
    avatar: "https://i.pravatar.cc/150?img=18",
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
        mb={6}
      >
        Trusted by Teachers and Students
      </Text>

      <Marquee pauseOnHover gradient={false} speed={50}>
        {testimonials.map((t, index) => (
          <Box
            key={index}
            bg="whiteAlpha.300"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255,255,255,0.2)"
            p={6}
            mx={4}
            minW="300px"
            rounded="lg"
            shadow="md"
          >
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
