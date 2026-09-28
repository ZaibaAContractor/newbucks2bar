package com.bucks2bar.repository;

import com.bucks2bar.model.Mentor;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MentorRepository extends JpaRepository<Mentor, Long> {
  Optional<Mentor> findByName(String name);
}
