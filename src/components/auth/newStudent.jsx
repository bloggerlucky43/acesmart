import {
  Box,
  Text,
  Image,
  Fieldset,
  Input,
  Button,
  Field,
  Flex,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { addStudent } from "../../api-endpoint/student/students";
import { toaster } from "../ui/toaster";
import imageCompression from "browser-image-compression";
import CropModal from "../CropModal";
import { getCroppedImg } from "../CropImage";

const NewStudent = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    studentemail: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const fileInputRef = useRef(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toaster.warning({ title: "Please select an image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result); // base64
      setShowCrop(true); // open crop modal
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (pixelCrop) => {
    try {
      // Crop
      if (!rawImage || !pixelCrop) return;

      const croppedFile = await getCroppedImg(rawImage, pixelCrop);

      // Compress
      const compressed = await imageCompression(croppedFile, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      setImage(compressed); // this is what gets uploaded
      setPreview(URL.createObjectURL(compressed));

      setShowCrop(false);
      setRawImage(null);

      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(compressed));
    } catch (err) {
      toaster.error({ title: "Image processing failed" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.studentemail) {
      toaster.warning({ title: "All fields are required" });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("studentEmail", form.studentemail);

    if (image) {
      formData.append("face", image);
    }

    setLoading(true);
    const res = await addStudent(formData);

    console.log("at res", res);

    if (res.success && res.message === "Student Added Successfully") {
      toaster.create({ title: "Student added successfully", type: "success" });

      setForm({ firstName: "", lastName: "", studentemail: "" });
      setImage(null);
      setPreview(null);
    }
    setLoading(false);
  };
  return (
    <Flex
      rounded="md"
      mt="9vh"
      ml="200px"
      justifySelf={"center"}
      w={"calc(100% - 200px)"}
      p={4}
      minH="100vh"
      color="gray.900"
      bg="gray.200"
    >
      <Fieldset.Root size="lg" maxW="4xl">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Box>
            <Text fontSize="xl" mt={4} fontWeight="bold">
              Add New Student
            </Text>
            <Text mb={4}>
              Fill in the details below to add a student to the system
            </Text>
          </Box>

          <Fieldset.Content>
            <Flex gap={8} align={"flex-start"} wrap="wrap">
              <Box mt={6}>
                <Text fontSize="sm" mb={2}>
                  Student Image
                </Text>

                {/* Clickable Upload Box */}
                <Box
                  w="180px"
                  h="180px"
                  border="2px dashed"
                  borderColor="gray.400"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  bg="gray.100"
                  _hover={{ borderColor: "primary" }}
                  onClick={() => fileInputRef.current.click()}
                  overflow="hidden"
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Student preview"
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Click to upload image
                    </Text>
                  )}
                </Box>

                {/* Hidden File Input */}
                <Input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  display="none"
                  onChange={handleImageChange}
                />
              </Box>

              <Field.Root required>
                <Field.Label>
                  First name
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="name"
                  placeholder="Enter your firstname"
                  value={form.firstName}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>
                  Last name
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  name="lastname"
                  placeholder="Enter your surname"
                  value={form.lastName}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>
                  Student Email
                  <Field.RequiredIndicator />
                </Field.Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="e.g example@gmail.com"
                  value={form.studentemail}
                  borderColor="gray.800"
                  _focus={{ outline: "none", borderColor: "primary" }}
                  onChange={(e) =>
                    setForm({ ...form, studentemail: e.target.value })
                  }
                  required
                />
              </Field.Root>
            </Flex>
          </Fieldset.Content>
          <Button
            type="submit"
            w="full"
            mt={2}
            borderRadius="md"
            bg="primary"
            loading={loading}
            spinnerPlacement="center"
          >
            Apply
          </Button>
        </form>
      </Fieldset.Root>

      {showCrop && (
        <CropModal
          image={rawImage}
          onComplete={handleCropComplete}
          onClose={() => setShowCrop(false)}
        />
      )}
    </Flex>
  );
};

export default NewStudent;
