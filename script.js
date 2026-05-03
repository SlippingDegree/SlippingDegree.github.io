/**
 * MetaSynth Platform - Submissions Handler
 * 
 * This script handles the integration with Supabase for the Request Form.
 * Note: The current design (v2.0) has hidden the form fields. This script
 * is maintained for backward compatibility and future form reintegration.
 */

// Initialize Supabase client
const supabaseUrl = "https://ozhjabqkrnqxpphnyldz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96aGphYnFrcm5xeHBwaG55bGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzQ3ODksImV4cCI6MjA5MzE1MDc4OX0.Gq4Rb0778UsSAD_7DuyJacleBTJ_K1UMfPw2wtzpkLk";

// Create client instance using the Supabase SDK loaded via CDN
const supabaseClient = (typeof supabase !== 'undefined') ? supabase.createClient(supabaseUrl, supabaseAnonKey) : null;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("requestForm");
  const statusBox = document.getElementById("status");
  const scannerLine = document.getElementById("scannerLine");

  // Only attach listeners if the form element exists in the DOM
  if (form && supabaseClient) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // UI Loading State
      if (statusBox) {
        statusBox.textContent = "STATUS: PROCESSING...";
        statusBox.className = "status mono-data";
      }
      if (scannerLine) scannerLine.classList.add("active");

      // Extract form data
      const formData = new FormData(form);
      const submission = {
        name: formData.get("name")?.trim(),
        email: formData.get("email")?.trim(),
        deadline: formData.get("deadline"),
        project_type: formData.get("project_type"),
        notes: formData.get("notes")?.trim(),
      };

      // Handle Optional File Upload
      let fileUrl = null;
      const fileInput = form.querySelector("input[name='file']");
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const bucketName = "research_uploads";
        const path = `research/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabaseClient.storage
          .from(bucketName)
          .upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
          });

        if (uploadError) {
          handleError("STATUS: ERROR - UPLOAD FAILED", uploadError);
          return;
        }

        const { data: publicUrlData } = supabaseClient.storage
          .from(bucketName)
          .getPublicUrl(path);

        fileUrl = publicUrlData.publicUrl;
      }

      // Insert into Supabase 'submissions' table
      const { error } = await supabaseClient
        .from("submissions")
        .insert([{ ...submission, file_url: fileUrl }]);

      // Stop Loading State
      if (scannerLine) scannerLine.classList.remove("active");

      if (error) {
        handleError("STATUS: ERROR - SAVE FAILED", error);
        return;
      }

      // Success UI
      if (statusBox) {
        statusBox.textContent = "STATUS: SUCCESS - REQUEST EXECUTED";
        statusBox.classList.add("success");
      }
      form.reset();
    });
  }

  /**
   * Centralized Error Handler
   */
  function handleError(message, error) {
    console.error(message, error);
    if (statusBox) {
      statusBox.textContent = message;
      statusBox.classList.add("error");
    }
    if (scannerLine) scannerLine.classList.remove("active");
  }
});
